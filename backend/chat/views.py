from rest_framework.exceptions import NotFound
from django.shortcuts import render
from rest_framework.response import Response

from rest_framework import generics
from rest_framework import permissions

from rest_framework import status
from rest_framework.decorators import api_view,APIView,permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from main.serializers import CustomerSerializer,TripSerializer,AdminSerializer, MessagesDMSeriliazer, ConversationDMSerializer, GroupChatConversationSerializer, MessageGroupSerializer, SupportTicketSerializer
from django.contrib.auth import authenticate,get_user_model
from rest_framework.permissions import IsAuthenticated

from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from main.models import Trip, Customer, MessageDM, ConversationDM, GroupChatConversation, MessageGroup, SupportTicket


class ListMessages(generics.ListAPIView):
    serializer_class = MessagesDMSeriliazer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        conversation = get_object_or_404(ConversationDM, id =conversation_id)

        user = self.request.user
        if user == conversation.staff.user or user == conversation.cust.user:
            return MessageDM.objects.filter(conversation=conversation).order_by("timestamp")
        return MessageDM.objects.none()


class ListConversation(generics.ListAPIView):

    serializer_class = ConversationDMSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'customer'):
            return ConversationDM.objects.filter(cust__user=user)
        elif hasattr(user, 'admin'):
            return ConversationDM.objects.filter(staff__user=user)
        return ConversationDM.objects.none()
    

class ListGroupMessages(generics.ListAPIView):
    
    serializer_class = MessageGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        conversation = get_object_or_404(GroupChatConversation, id=conversation_id)

        # Vérifie si l'utilisateur fait partie du groupe
        user = self.request.user
        if conversation.participants.filter(id=user.id).exists():
            return MessageGroup.objects.filter(conversation=conversation).order_by("sent_at")

        return MessageGroup.objects.none()


class ListGroupConversations(generics.ListAPIView):
   
    serializer_class = GroupChatConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return GroupChatConversation.objects.filter(participants=user)
    


class SupportTicketView(generics.ListCreateAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'customer'):
            return SupportTicket.objects.filter(customer=self.request.user.customer)
        return SupportTicket.objects.none
    
    def perform_create(self, serializer):
        if hasattr(self.request.user, 'customer'):
            serializer.save(customer=self.request.user.customer)


class AcceptTicketView(generics.UpdateAPIView):
    queryset = SupportTicket.objects.filter(status='pending')
    serializer_class = SupportTicketSerializer

    def perform_update(self, serializer):
         if hasattr(self.request.user, 'admin') and self.request.user.admin.department == 'customer_support':
            serializer.save(
                status='accepted',
                accepted_by=self.request.user.admin
            )
           
            ConversationDM.objects.create(
                staff=self.request.user.admin,
                cust=serializer.instance.customer,
                ticket=serializer.instance,
                conversation_type='support'
            )