"""from rest_framework import serializers
from .models import Conversation,GroupConversation,Message,SupportTicket, DirectConversation

class DirectConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DirectConversation
        fields = ['id', 'customer', 'admin', 'created_at', 'updated_at', 'is_active']

class GroupConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupConversation
        fields = ['id', 'trip', 'participants', 'created_at', 'updated_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'timestamp', 'read']


class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields=['id', 'subject', 'description', 'status', 'created_at', 'accepted_by']
        read_only_fields = ['created_at']
"""
from rest_framework import serializers
from .models import Conversation, GroupConversation, Message, SupportTicket, DirectConversation
from main.models import User  



from channels_redis.serializers import MsgPackSerializer
import uuid
import msgpack

class UUIDSerializer(MsgPackSerializer):
    def encode(self, obj):
        # Convert UUIDs to strings before serialization
        if isinstance(obj, uuid.UUID):
            return str(obj)
        return super().encode(obj)

    def decode(self, data):
        obj = super().decode(data)
        # Convert UUID strings back to UUID objects if needed
        if isinstance(obj, str):
            try:
                return uuid.UUID(obj)
            except ValueError:
                pass
        return obj


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_online']

class DirectConversationSerializer(serializers.ModelSerializer):
    customer = UserBriefSerializer()
    admin = UserBriefSerializer()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DirectConversation
        fields = [
            'id', 'customer', 'admin', 
            'created_at', 'updated_at', 'is_active',
            'unread_count', 'ticket'
        ]
        read_only_fields = fields  

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(read=False).exclude(sender=request.user).count()
        return 0

class GroupConversationSerializer(serializers.ModelSerializer):
    participants = UserBriefSerializer(many=True)
    trip_title = serializers.CharField(source='trip.title', read_only=True)
    
    class Meta:
        model = GroupConversation
        fields = [
            'id', 'trip', 'trip_title', 'participants',
            'created_at', 'updated_at'
        ]
    def get_recent_messages(self, obj):
        messages = obj.messages.order_by('-timestamp')[:10]
        messages = reversed(messages)
        return MessageSerializer(messages, many=True, context=self.context).data


class MessageSerializer(serializers.ModelSerializer):
    sender = UserBriefSerializer()
    is_own = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender',
            'content', 'timestamp', 'read', 'is_own'
        ]
        read_only_fields = fields  

    def get_is_own(self, obj):
        request = self.context.get('request')
        return request and obj.sender == request.user

class SupportTicketSerializer(serializers.ModelSerializer):
    customer = UserBriefSerializer(read_only=True)
    accepted_by = UserBriefSerializer(read_only=True, source='admin')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    conversation_id = serializers.SerializerMethodField()
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'subject', 'description',
            'status', 'status_display', 'created_at',
            'customer', 'accepted_by', 'conversation_id'
        ]
        read_only_fields = [
            'created_at', 'status_display',
            'customer', 'conversation_id'
        ]

    def get_conversation_id(self, obj):
        if hasattr(obj, 'directconversation'):
            return obj.directconversation.id
        return None