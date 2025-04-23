from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import (
    DirectConversation, GroupConversation, Message, SupportTicket
)
from .serializers import (
    DirectConversationSerializer, GroupConversationSerializer,
    MessageSerializer, SupportTicketSerializer
)
from .permissions import IsParticipantOrAdmin

class DirectConversationViewSet(viewsets.ModelViewSet):
    serializer_class = DirectConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsParticipantOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        return DirectConversation.objects.filter(
            Q(customer=user) | Q(admin=user)
        ).select_related('customer', 'admin', 'ticket')
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all()
        
        # Mark messages as read if user is not the sender
        if conversation.customer == request.user:
            messages.filter(sender=conversation.admin, read=False).update(read=True)
        elif conversation.admin == request.user:
            messages.filter(sender=conversation.customer, read=False).update(read=True)
            
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        serializer = MessageSerializer(data={
            'conversation': conversation.id,
            'content': request.data.get('content')
        }, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            # Update conversation timestamp
            conversation.save()  # This will update the updated_at field
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupConversationViewSet(viewsets.ModelViewSet):
    serializer_class = GroupConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsParticipantOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        return GroupConversation.objects.filter(
            participants=user
        ).prefetch_related('participants', 'trip')
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        conversation = self.get_object()
        if conversation.join(request.user):
            return Response({'status': 'joined'}, status=status.HTTP_200_OK)
        return Response({'status': 'already a member'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all()
        # No read status tracking for group messages
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        serializer = MessageSerializer(data={
            'conversation': conversation.id,
            'content': request.data.get('content')
        }, context={'request': request})
        
        if serializer.is_valid():
            message = serializer.save()
            # Update conversation timestamp
            conversation.save()  # This will update the updated_at field
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:  # For admin users
            return SupportTicket.objects.all().select_related('customer', 'admin')
        # For regular users, only show their own tickets
        return SupportTicket.objects.filter(customer=user).select_related('customer', 'admin')
    
    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Only staff can claim tickets'}, 
                          status=status.HTTP_403_FORBIDDEN)
                          
        ticket = self.get_object()
        if ticket.claim(request.user):
            return Response({'status': 'claimed'}, status=status.HTTP_200_OK)
        return Response({'error': 'Cannot claim this ticket'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        ticket = self.get_object()
        # Check if user is the ticket owner or an admin
        if request.user == ticket.customer or request.user.is_staff:
            ticket.close()
            return Response({'status': 'closed'}, status=status.HTTP_200_OK)
        return Response({'error': 'You cannot close this ticket'}, 
                       status=status.HTTP_403_FORBIDDEN)
                       
    @action(detail=True, methods=['get'])
    def conversation(self, request, pk=None):
        ticket = self.get_object()
        try:
            conversation = DirectConversation.objects.get(ticket=ticket)
            serializer = DirectConversationSerializer(conversation, context={'request': request})
            return Response(serializer.data)
        except DirectConversation.DoesNotExist:
            return Response({'error': 'No conversation exists for this ticket'}, 
                           status=status.HTTP_404_NOT_FOUND)