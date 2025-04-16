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
from main.models import SupportTicket
from main.serializers import SupportTicketSerializer

class ListMessages(generics.ListAPIView):
    serializer_class = MessagesDMSeriliazer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        try:
            conversation = ConversationDM.objects.get(id=conversation_id)
        except ConversationDM.DoesNotExist:
            raise NotFound("Conversation not found.")

        
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


class LatestSupportTicketAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'customer'):
            ticket = SupportTicket.objects.filter(customer=request.user.customer).order_by('-created_at').first()
            if ticket:
                serializer = SupportTicketSerializer(ticket)
                return Response(serializer.data)
        return Response({})


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
            group_chat.save()

           
            if request.data.get('title'):
                group_chat.title = request.data['title']
                group_chat.save()

            serializer = GroupChatConversationSerializer(group_chat)
            return Response(serializer.data)

        except Trip.DoesNotExist:
            return Response({"error": "Trip not found"}, status=404)

        

class CreatePrivateChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        try:
           
            user = get_object_or_404(Customer, id=user_id)
            other_user = user.user

           
            if request.user == other_user:
                return Response({"error": "You cannot start a chat with yourself."}, status=400)

            
            conversation, created = ConversationDM.objects.get_or_create(
                cust=user, staff=request.user.admin if hasattr(request.user, 'admin') else None)

            serializer = ConversationDMSerializer(conversation)
            return Response(serializer.data)

        except Customer.DoesNotExist:
            return Response({"error": "User not found"}, status=404)