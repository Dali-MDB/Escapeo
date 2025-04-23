from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Conversation, DirectConversation, GroupConversation, 
    Message, SupportTicket
)
from main.serializers import UserSerializer
User = get_user_model()



class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_details', 'content', 
                 'timestamp', 'read']
        read_only_fields = ['sender', 'timestamp']
    
    def create(self, validated_data):
        # Set sender to current user
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class DirectConversationSerializer(serializers.ModelSerializer):
    customer_details = UserSerializer(source='customer', read_only=True)
    admin_details = UserSerializer(source='admin', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DirectConversation
        fields = ['id', 'customer', 'customer_details', 'admin', 'admin_details', 
                 'is_active', 'created_at', 'updated_at', 'last_message', 'unread_count']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'content': last_msg.content,
                'timestamp': last_msg.timestamp,
                'sender': last_msg.sender.username
            }
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        return obj.messages.filter(read=False).exclude(sender=request.user).count()


class GroupConversationSerializer(serializers.ModelSerializer):
    trip_name = serializers.ReadOnlyField(source='trip.title')
    participants_details = UserSerializer(source='participants', many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = GroupConversation
        fields = ['id', 'trip', 'trip_name', 'participants', 
                 'participants_details', 'created_at', 'updated_at', 
                 'last_message']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'content': last_msg.content,
                'timestamp': last_msg.timestamp,
                'sender': last_msg.sender.username
            }
        return None


class SupportTicketSerializer(serializers.ModelSerializer):
    customer_details = UserSerializer(source='customer', read_only=True)
    admin_details = UserSerializer(source='admin', read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = ['id', 'customer', 'customer_details', 'subject', 'description',
                 'created_at', 'updated_at', 'status', 'admin', 'admin_details']
        read_only_fields = ['customer', 'admin', 'status']
    
    def create(self, validated_data):
        # Set customer to current user
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)