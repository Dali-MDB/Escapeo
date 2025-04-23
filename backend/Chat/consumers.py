# Optional WebSocket implementation for real-time chat functionality
# Requires channels package: pip install channels
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message, DirectConversation, GroupConversation

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        
        # Check if user has access to this conversation
        if await self.can_access_conversation():
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        
        # Save message to database
        message_obj = await self.save_message(message)
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': self.user.id,
                'sender_name': self.user.username,
                'timestamp': message_obj['timestamp'].isoformat()
            }
        )
    
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'timestamp': event['timestamp']
        }))
    
    @database_sync_to_async
    def can_access_conversation(self):
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            user = self.user
            
            if hasattr(conversation, 'directconversation'):
                direct = conversation.directconversation
                return user == direct.customer or user == direct.admin
                
            if hasattr(conversation, 'groupconversation'):
                group = conversation.groupconversation
                return group.participants.filter(id=user.id).exists()
                
            return False
        except Conversation.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, content):
        conversation = Conversation.objects.get(id=self.conversation_id)
        message = Message.objects.create(
            conversation=conversation,
            sender=self.user,
            content=content
        )
        # Update conversation timestamp
        conversation.save()
        
        # For direct conversations, mark as read for sender automatically
        if hasattr(conversation, 'directconversation'):
            # No need to mark sender's message as read
            pass
        
        return {
            'id': message.id,
            'timestamp': message.timestamp
        }