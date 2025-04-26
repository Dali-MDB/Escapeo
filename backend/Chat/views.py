from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.decorators import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Prefetch
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
import logging

from chat.models import DirectConversation, GroupConversation, Message, SupportTicket
from main.models import Trip, User
from .serializers import (
    DirectConversationSerializer, 
    GroupConversationSerializer,
    MessageSerializer, 
    SupportTicketSerializer,
    UserBriefSerializer
)

logger = logging.getLogger(__name__)

class MessagePagination(PageNumberPagination):
    page_size = 50
    max_page_size = 100
    page_size_query_param = 'page_size'
    ordering = ['timestamp']

# ==================== Direct Messaging ====================

class DirectConversationListView(generics.ListAPIView):
    serializer_class = DirectConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return DirectConversation.objects.filter(
            Q(customer=user) | Q(admin=user),
            is_active=True
        ).select_related('customer', 'admin', 'ticket').prefetch_related(
            Prefetch('messages', queryset=Message.objects.order_by('-timestamp'))
        ).order_by('-updated_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class DirectMessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MessagePagination

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        user = self.request.user
        
        conversation = get_object_or_404(
            DirectConversation.objects.filter(
                Q(customer=user) | Q(admin=user),
                id=conversation_id
            )
        )
        
        return Message.objects.filter(
            conversation=conversation
        ).select_related('sender').order_by('timestamp')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        unread_messages = queryset.filter(read=False).exclude(sender=request.user)
        if unread_messages.exists():
            unread_messages.update(read=True)
        
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data)

class CreateDirectConversationView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DirectConversationSerializer

    def create(self, request, user_id):
        try:
            other_user = User.objects.get(id=user_id)
            
            if request.user == other_user:
                return Response(
                    {"detail": "Cannot create conversation with yourself"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if hasattr(request.user, 'customer') and hasattr(other_user, 'admin'):
                customer, admin = request.user, other_user
            elif hasattr(request.user, 'admin') and hasattr(other_user, 'customer'):
                customer, admin = other_user, request.user
            else:
                return Response(
                    {"detail": "Direct conversations require one customer and one admin"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            conversation, created = DirectConversation.objects.get_or_create(
                customer=customer,
                admin=admin,
                defaults={'is_active': True}
            )

            serializer = self.get_serializer(conversation, context={'request': request})
            headers = self.get_success_headers(serializer.data)
            
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
                headers=headers
            )

        except User.DoesNotExist:
            raise NotFound(detail="User not found")

# ==================== Group Chat ====================

class GroupConversationListView(generics.ListAPIView):
    serializer_class = GroupConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GroupConversation.objects.filter(
            participants=self.request.user
        ).select_related('trip').prefetch_related(
            'participants',
            Prefetch('messages', queryset=Message.objects.order_by('-timestamp'))  # removed [:10]
        ).order_by('-updated_at')


class GroupMessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MessagePagination

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']

        conversation = get_object_or_404(
            GroupConversation.objects.filter(
                participants=self.request.user,
                id=conversation_id
            )
        )

        return Message.objects.filter(
            conversation=conversation
        ).select_related('sender').order_by('timestamp')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class CreateGroupConversationView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GroupConversationSerializer

    def create(self, request, trip_id):
        try:
            trip = Trip.objects.select_related('guide').get(id=trip_id)
            
            if not hasattr(request.user, 'admin') or request.user != trip.guide.user:
                raise PermissionDenied("Only the trip guide can create group chats")

            participants = list(trip.purchasers.all())
            participants.append(trip.guide.user)
            
            conversation, created = GroupConversation.objects.get_or_create(
                trip=trip,
                defaults={'is_active': True}
            )
            conversation.participants.set(participants)
            
            serializer = self.get_serializer(conversation, context={'request': request})
            headers = self.get_success_headers(serializer.data)
            
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )

        except Trip.DoesNotExist:
            raise NotFound(detail="Trip not found")

# ==================== Support Tickets ====================

class SupportTicketListView(generics.ListCreateAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = SupportTicket.objects.select_related(
            'customer', 'admin__user', 'directconversation'
        ).order_by('-created_at')
        
        if status := self.request.query_params.get('status'):
            queryset = queryset.filter(status=status)
            
        if hasattr(self.request.user, 'customer'):
            return queryset.filter(customer=self.request.user)
        elif hasattr(self.request.user, 'admin'):
            return queryset.filter(
                Q(status='open') | Q(admin=self.request.user.admin)
            )
        return queryset.none()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'customer'):
            serializer.save(customer=self.request.user)
        else:
            raise PermissionDenied("Only customers can create tickets")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class SupportTicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        queryset = SupportTicket.objects.select_related(
            'customer', 'admin', 'directconversation'
        )

        if hasattr(self.request.user, 'customer'):
            return queryset.filter(customer=self.request.user)
        elif hasattr(self.request.user, 'admin'):
            return queryset.filter(
                Q(status='open') | Q(admin=self.request.user)
            )
        return queryset.none()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Delete associated conversation if exists
        if hasattr(instance, 'directconversation'):
            instance.directconversation.delete()
        
        instance.delete()
        return Response(
            {"detail": "Support ticket and associated conversation deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class AcceptTicketView(generics.UpdateAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return SupportTicket.objects.filter(status='open').select_related('customer')

    def perform_update(self, serializer):
    # Check if the current user is an admin
        if not hasattr(self.request.user, 'admin'):
            raise PermissionDenied("Only admins can accept tickets")

    # Save the serializer, update the status, and assign the admin user
        ticket = serializer.save(
            status='claimed',  # Change the status to 'claimed'
            admin=self.request.user  # Assign the logged-in user as the admin
        )

    # Ensure a DirectConversation is created or updated
        DirectConversation.objects.get_or_create(
            ticket=ticket,
            defaults={
                'customer': ticket.customer,
                'admin': self.request.user,
                'is_active': True
            }
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class WebSocketInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'direct_chat': {
                'url': f'ws://{request.get_host()}/ws/chat/direct/<conversation_id>/',
                'description': 'Connect using conversation ID from direct conversations list'
            },
            'group_chat': {
                'url': f'ws://{request.get_host()}/ws/chat/group/<conversation_id>/',
                'description': 'Connect using group conversation ID'
            },
            'user': UserBriefSerializer(request.user).data
        })