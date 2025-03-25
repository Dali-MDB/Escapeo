from rest_framework.exceptions import NotFound
from django.shortcuts import render
from rest_framework.response import Response

from rest_framework import generics
from rest_framework import permissions

from rest_framework import status
from rest_framework.decorators import api_view,APIView,permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from main.serializers import CustomerSerializer,TripSerializer,AdminSerializer, MessagesDMSeriliazer, ConversationDMSerializer
from django.contrib.auth import authenticate,get_user_model
from rest_framework.permissions import IsAuthenticated

from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from main.models import Trip, Customer, MessageDM, ConversationDM


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