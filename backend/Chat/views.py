"""
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework.decorators import APIView
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated

from main.models import (
    Trip, Customer, Admin, MessageDM, ConversationDM,
    GroupChatConversation, MessageGroup, SupportTicket
)
from main.serializers import (
    MessagesDMSeriliazer, ConversationDMSerializer,
    GroupChatConversationSerializer, MessageGroupSerializer,
    SupportTicketSerializer
)
from rest_framework.exceptions import PermissionDenied
# ----------------- Direct Messaging ------------------

class ListMessages(generics.ListAPIView):
    serializer_class = MessagesDMSeriliazer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        conversation = get_object_or_404(ConversationDM, id=conversation_id)

        user = self.request.user
        if user == conversation.staff.user or user == conversation.cust.user:
            return MessageDM.objects.filter(conversation=conversation).order_by("timestamp")
        return MessageDM.objects.none()


class ListConversation(generics.ListAPIView):
    serializer_class = ConversationDMSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'customer'):
            return ConversationDM.objects.filter(cust__user=user)
        elif hasattr(user, 'admin'):
            return ConversationDM.objects.filter(staff__user=user)
        return ConversationDM.objects.none()

class CreatePrivateChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
       
        try:
            user = get_object_or_404(Customer, id=user_id)
            other_user = user.user

            if request.user == other_user:
                return Response({"error": "You cannot start a chat with yourself."}, status=400)

            conversation, created = ConversationDM.objects.get_or_create(
                cust=user,
                staff=request.user.admin if hasattr(request.user, 'admin') else None
            )

            serializer = ConversationDMSerializer(conversation)
            return Response(serializer.data)

        except Customer.DoesNotExist:
            return Response({"error": "User not found"}, status=404)


# ----------------- Group Chat ------------------

class ListGroupMessages(generics.ListAPIView):
    serializer_class = MessageGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        conversation = get_object_or_404(GroupChatConversation, id=conversation_id)

        if conversation.participants.filter(id=self.request.user.id).exists():
            return MessageGroup.objects.filter(conversation=conversation).order_by("sent_at")
        return MessageGroup.objects.none()


class ListGroupConversations(generics.ListAPIView):
    serializer_class = GroupChatConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GroupChatConversation.objects.filter(participants=self.request.user)


class CreateGroupChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_id):
        
        try:
            trip = Trip.objects.get(id=trip_id)

            if not hasattr(request.user, 'admin') or request.user.admin != trip.guide:
                return Response({"error": "Only the trip's guide can create the group chat."}, status=403)

            participants = [trip.guide.user] + [c.user for c in trip.purchasers.all()]
            if len(participants) < 2:
                return Response({"error": "Not enough participants to create a group chat."}, status=400)

            group_chat, created = GroupChatConversation.objects.get_or_create(trip=trip)
            group_chat.participants.set(participants)

            if 'title' in request.data:
                group_chat.title = request.data['title']
            group_chat.save()

            serializer = GroupChatConversationSerializer(group_chat)
            return Response(serializer.data)

        except Trip.DoesNotExist:
            return Response({"error": "Trip not found"}, status=404)


# ----------------- Support Tickets ------------------

class SupportTicketView(generics.ListCreateAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'customer'):
            return SupportTicket.objects.filter(customer=self.request.user.customer)
        return SupportTicket.objects.none()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'customer'):
            serializer.save(customer=self.request.user.customer)

import logging
class AcceptTicketView(generics.UpdateAPIView):
    queryset = SupportTicket.objects.filter(status='pending')
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        logger = logging.getLogger(__name__)
        logger.debug(f"Performing update for ticket {serializer.instance.id}")

        if not hasattr(self.request.user, 'admin'):
            logger.debug("User is not an admin")
            raise PermissionDenied("Only admins can accept tickets")

        # Uncomment this if you want to restrict to customer_support department only
        # if self.request.user.admin.department != 'customer_support':
        #     logger.debug(f"Admin department {self.request.user.admin.department} not authorized")
        #     raise PermissionDenied("Only customer support admins can accept tickets")

        # Update the ticket
        serializer.save(
            status='accepted',
            accepted_by=self.request.user.admin
        )

        # Create conversation if it's a support ticket
        ConversationDM.objects.create(
            staff=self.request.user.admin,
            cust=serializer.instance.customer,
            ticket=serializer.instance,
            conversation_type='support'
        )

    def update(self, request, *args, **kwargs):
        logger = logging.getLogger(__name__)
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(SupportTicketSerializer(serializer.instance).data)
        except Exception as e:
            logger.error(f"Error accepting ticket: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)    

class LatestSupportTicketAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'customer'):
            ticket = SupportTicket.objects.filter(customer=request.user.customer).order_by('-created_at').first()
            if ticket:
                serializer = SupportTicketSerializer(ticket)
                return Response(serializer.data)
        return Response({})
"""

from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.decorators import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Prefetch
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
import logging

from Chat.models import DirectConversation, GroupConversation, Message, SupportTicket
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
"""
class GroupConversationListView(generics.ListAPIView):
    serializer_class = GroupConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GroupConversation.objects.filter(
            participants=self.request.user
        ).select_related('trip').prefetch_related(
            'participants',
            Prefetch('messages', queryset=Message.objects.order_by('-timestamp')[:10])
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
    """

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
            'customer', 'admin', 'directconversation'
        ).order_by('-created_at')
        
        if status := self.request.query_params.get('status'):
            queryset = queryset.filter(status=status)
            
        if hasattr(self.request.user, 'customer'):
            return queryset.filter(customer=self.request.user)
        elif hasattr(self.request.user, 'admin'):
            return queryset.filter(
                Q(status='open') 
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
            return queryset.filter(admin=self.request.user)
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