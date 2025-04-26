import json
import uuid
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from channels.db import database_sync_to_async
from django.db.models import Q
from .models import DirectConversation, Message, GroupConversation
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from django.core.exceptions import ObjectDoesNotExist, ValidationError

User = get_user_model()

class BaseChatConsumer(AsyncWebsocketConsumer):
    
    async def send_error(self, message, code=None):
        """Standardized error response format"""
        error_data = {
            'type': 'error',
            'message': message,
            'timestamp': timezone.now().isoformat()
        }
        if code:
            error_data['code'] = code
        await self.send(text_data=json.dumps(error_data))

    @database_sync_to_async
    def set_user_online(self):
        """Mark user as online in database"""
        self.user.is_online = True
        self.user.last_seen = timezone.now()
        self.user.save()

    @database_sync_to_async
    def set_user_offline(self):
        """Mark user as offline in database"""
        self.user.is_online = False
        self.user.last_seen = timezone.now()
        self.user.save()

    @database_sync_to_async
    def get_user_data(self):
        """Serialize basic user data with UUID converted to string"""
        return {
            'id': str(self.user.id),  # Convert UUID to string
            'username': self.user.username,
            'is_online': self.user.is_online
        }

class PrivateChatConsumer(BaseChatConsumer):

    async def connect(self):
        # Extract JWT token from headers
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.user = await self.authenticate_user()
        
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)  # Unauthorized
            return

        self.conversation = await self.get_authorized_conversation()
        if not self.conversation:
            await self.close(code=4003)  # Forbidden
            return

        self.room_group_name = f"private_{self.conversation_id}"
        await self.set_user_online()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.broadcast_presence('online')

    @database_sync_to_async
    def authenticate_user(self):
        """Validate JWT token and return user"""
        try:
            headers = dict(self.scope["headers"])
            if b'authorization' in headers:
                token = headers[b'authorization'].decode().split()[1]
                access_token = AccessToken(token)
                return User.objects.get(id=access_token['user_id'])
        except Exception as e:
            print(f"Authentication error: {e}")
            return None
    @database_sync_to_async
    def get_authorized_conversation(self):
        """Get conversation with UUIDs converted to string"""
        conversation = DirectConversation.objects.filter(
            Q(id=self.conversation_id),
            Q(customer=self.user) | Q(admin=self.user),
            is_active=True
        ).select_related('customer', 'admin', 'ticket').first()
        if conversation:
            conversation.id = str(conversation.id)
            if conversation.ticket:
                conversation.ticket.id = str(conversation.ticket.id)
            if conversation.customer:
                conversation.customer.id = str(conversation.customer.id)
            if conversation.admin:
                conversation.admin.id = str(conversation.admin.id)
        return conversation

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            
            if action == 'send':
                await self.handle_send(data)
            elif action == 'typing':
                await self.handle_typing(data)
            elif action == 'read':
                await self.handle_read(data)
            elif action == 'edit':  # Add edit handler
                await self.handle_edit(data)
            else:
                await self.send_error(f"Unknown action: {action}", code="invalid_action")
            
                
        except json.JSONDecodeError:
            await self.send_error("Invalid message format", code="invalid_format")

    async def handle_send(self, data):
        message = data.get('message', '').strip()
        
        if not message:
            return await self.send_error("Message cannot be empty", code="empty_message")
        if len(message) > 2000:
            return await self.send_error("Message too long (max 2000 chars)", code="message_too_long")

        if self.conversation.ticket and not await self.validate_ticket():
            return await self.send_error("Support ticket is closed", code="ticket_closed")

        message_data = await self.create_message(message)
        await self.broadcast({
            'type': 'message',
            'id': message_data['id'],
            'sender': message_data['sender'],
            'content': message_data['content'],
            'timestamp': message_data['timestamp'].isoformat(),
            'is_support': bool(self.conversation.ticket)
            })

    async def handle_typing(self, data):
        
        await self.broadcast({
            'type': 'typing',
            'user': await self.get_user_data(),
            'is_typing': data.get('is_typing', False)
        })

    async def handle_read(self, data):
      
        message_id = data.get('message_id')
        if message_id and await self.mark_message_read(message_id):
            await self.broadcast({
                'type': 'read_receipt',
                'message_id': message_id,
                'reader': await self.get_user_data(),
                'timestamp': timezone.now().isoformat()
            })

    async def broadcast_presence(self, status):
        """Broadcast presence update"""
        await self.broadcast({
            'type': 'presence',
            'user': await self.get_user_data(),
            'status': status,
            'timestamp': timezone.now().isoformat()
        })

    async def broadcast(self, data):
       
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'data': data
            }
        )

    async def chat_message(self, event):
        
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def get_user_data(self):
        """Serialize user data with UUID converted to string"""
        return {
            'id': str(self.user.id),  # UUID to string
            'username': self.user.username,
            'is_online': self.user.is_online
        }

    @database_sync_to_async
    def validate_ticket(self):
        
        if not self.conversation.ticket:
            return False
        self.conversation.ticket.refresh_from_db()
        return self.conversation.ticket.status in ['open', 'claimed']

    @database_sync_to_async
    def create_message(self, content):
        """Create message and return with UUID as string"""
        message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content=content
        )
    # Force UUID to string for compatibility
        return {
            'id': str(message.id),
            'content': message.content,
            'timestamp': message.timestamp,
            'sender': {
                'id': str(self.user.id),
                'username': self.user.username,
                'is_online': self.user.is_online
                }
            }
    @database_sync_to_async
    def mark_message_read(self, message_id):   
        """Mark message as read with UUID/string handling"""
        try:
        # Convert string message_id to UUID if needed
            try:
                message_uuid = uuid.UUID(message_id) if isinstance(message_id, str) else message_id
            except (ValueError, AttributeError):
                return False
            
            message = Message.objects.get(
                id=message_uuid,
                conversation=self.conversation,
                read=False
            )
        
            if message.sender != self.user:
                message.read = True
                message.save()
                return True
        except Message.DoesNotExist:
            return False
        except Exception as e:
            print(f"Error marking message read: {e}")
            return False




    async def handle_edit(self, data):
        """Handle message editing with string IDs"""
        try:
            message_id_str = data.get("message_id")
            new_content = data.get("new_content")

            print(f"Attempting to edit message {message_id_str}")  # Debug log

            # Validate inputs
            if not message_id_str:
                await self.send_error("Missing message_id", code="invalid_data")
                return
            if not new_content:
                await self.send_error("Missing new_content", code="invalid_data")
                return

            # Update message
            success = await self._update_message_db(message_id_str, new_content)
            if not success:
                await self.send_error("Message not found or not authorized", code="edit_failed")
                return

        # Broadcast edit
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat.message_edited",
                    "message_id": message_id_str,
                    "new_content": new_content,
                    "sender_id": str(self.user.id),
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            print(f"Edit error: {str(e)}")  # Debug log
            await self.send_error(f"Edit error: {str(e)}", code="server_error")

    @database_sync_to_async
    def _update_message_db(self, message_id_str, new_content):
        """Update message using string ID"""
        try:
        # Convert string ID to integer for database query
            message_id = int(message_id_str)
        
            message = Message.objects.get(
                id=message_id,  # Database uses integer ID
                sender=self.user,  # Only allow sender to edit
                conversation=self.conversation
            )
            message.content = new_content
            message.save()
            return True
        except (ValueError, Message.DoesNotExist, ValidationError) as e:
            print(f"Edit failed: {str(e)}")  # Debug logging
            return False

    async def chat_message_edited(self, event):
        """Handle edited message event with string IDs"""
        await self.send(text_data=json.dumps({
        "type": "message_edited",
        "message_id": event["message_id"],  # String ID
        "new_content": event["new_content"],
        "sender_id": event["sender_id"],  # String ID
        "timestamp": event["timestamp"]
    }))








    async def disconnect(self, close_code):
        
        if hasattr(self, 'room_group_name'):
            await self.broadcast_presence('offline')
            await self.set_user_offline()
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


import json
import uuid
from django.utils import timezone
from channels.db import database_sync_to_async
from .models import GroupConversation, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class GroupChatConsumer(BaseChatConsumer):
    
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close(code=4001)
            return

        self.conversation = await self.get_authorized_conversation()
        if not self.conversation:
            await self.send_error("Group not accessible", code="no_access")
            await self.close(code=4003)
            return

        if not await self.validate_guide_presence():
            await self.send_error("No guide in conversation", code="no_guide")
            await self.close(code=4003)
            return

        self.room_group_name = f"group_{self.group_id}"
        await self.set_user_online()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    @database_sync_to_async
    def get_authorized_conversation(self):
        conversation = GroupConversation.objects.filter(
            id=self.group_id,
            participants=self.user
        ).select_related('trip', 'trip__guide').prefetch_related('participants').first()
        
        if conversation:
            # Convert UUID to string for serialization
            conversation.id = str(conversation.id)
            if conversation.trip:
                conversation.trip.id = str(conversation.trip.id)
                if conversation.trip.guide:
                    conversation.trip.guide.id = str(conversation.trip.guide.id)
        return conversation

    @database_sync_to_async
    def validate_guide_presence(self):
        return (self.conversation and 
                self.conversation.trip and 
                self.conversation.trip.guide and 
                self.conversation.trip.guide.user in self.conversation.participants.all())

    @database_sync_to_async
    def get_participants_data(self):
        participants = []
        if not self.conversation:
            return participants
            
        for user in self.conversation.participants.all().select_related('admin'):
            participants.append({
                'id': str(user.id),  # Convert UUID to string
                'username': user.username,
                'is_guide': hasattr(user, 'admin') and user.admin == self.conversation.trip.guide,
                'is_online': user.is_online,
                'last_seen': user.last_seen.isoformat() if user.last_seen else None
            })
        return participants

    async def send_participant_list(self):
        participants = await self.get_participants_data()
        await self.send(text_data=json.dumps({
            'type': 'participant_list',
            'participants': participants,
            'timestamp': timezone.now().isoformat()
        }))

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            
            handler = getattr(self, f'handle_{action}', None)
            if handler:
                await handler(data)
            else:
                await self.send_error(f"Unknown action: {action}", code="invalid_action")
                
        except json.JSONDecodeError:
            await self.send_error("Invalid message format", code="invalid_format")
        except Exception as e:
            await self.send_error(f"Server error: {str(e)}", code="server_error")

    async def handle_send(self, data):
        message = data.get('message', '').strip()
        
        if not message:
            return await self.send_error("Message cannot be empty", code="empty_message")
        if len(message) > 2000:
            return await self.send_error("Message too long (max 2000 chars)", code="message_too_long")

        message_obj = await self.create_message(message)
        if not message_obj:
            return await self.send_error("Failed to create message", code="message_creation_failed")

        await self.broadcast({
            'type': 'message',
            'id': str(message_obj.id),
            'sender': await self.get_user_data(),
            'content': message,
            'timestamp': message_obj.timestamp.isoformat(),
            'is_guide': await self.is_user_guide()
        })

    async def handle_typing(self, data):
        await self.broadcast({
            'type': 'typing',
            'user': await self.get_user_data(),
            'is_typing': data.get('is_typing', False)
        })



    async def handle_delete(self, data):
        try:
            message_id_str = data.get("message_id")
        
        # Validate input
            if not message_id_str:
                await self.send_error("Missing message_id", code="invalid_input")
                return

        # Convert to integer (since your Message model uses IntegerField)
            try:
                message_id = int(message_id_str)
            except ValueError:
                await self.send_error("Invalid message ID format", code="invalid_id")
                return

        # Delete message
            success = await self._delete_message_db(message_id)
            if not success:
                await self.send_error("Message not found or not authorized", code="delete_failed")
                return

        # Broadcast deletion
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat.message_deleted",
                    "message_id": message_id_str,  # Keep as string for consistency
                    "deleted_by": str(self.user.id),
                    "timestamp": timezone.now().isoformat()
                }
            )

        except Exception as e:
            await self.send_error(f"Server error: {str(e)}", code="server_error")

    async def chat_message_deleted(self, event):
        """Handle deleted message event"""
        await self.send(text_data=json.dumps({
            "type": "message_deleted",
            "message_id": event["message_id"],
            "deleted_by": event["deleted_by"],
            "timestamp": event["timestamp"]
        }))

    @database_sync_to_async
    def _delete_message_db(self, message_id):
        """Internal method to delete message"""
        try:
            message = Message.objects.get(
                id=message_id,
                sender=self.user,  # Only allow sender to delete
                conversation=self.conversation
            )
            message.delete()
            return True
        except (Message.DoesNotExist, ValidationError):
            return False




    async def handle_edit(self, data):
        try:
            message_id_str = data.get("message_id")  # Get as string
            new_content = data.get("new_content")

            # Validate inputs
            if not message_id_str or not new_content:
                await self.send_error("Missing message_id or content", code="invalid_input")
                return

            # Convert to integer (since your message_id is an integer in DB)
            try:
                message_id = int(message_id_str)
            except ValueError:
                await self.send_error("Invalid message ID format", code="invalid_id")
                return

            # Update message
            success = await self._update_message_db(message_id, new_content)
            if not success:
                await self.send_error("Message not found or not authorized", code="edit_failed")
                return

            # Broadcast edit (using original string ID)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat.message_edited",
                    "message_id": message_id_str,  # Keep as string for consistency
                    "new_content": new_content,
                    "sender_id": str(self.user.id),
                    "timestamp": timezone.now().isoformat()
                }
            )

        except Exception as e:
            await self.send_error(f"Server error: {str(e)}", code="server_error")

    async def chat_message_edited(self, event):
        """Handle edited message event"""
        await self.send(text_data=json.dumps({
            "type": "message_edited",
            "message_id": event["message_id"],
            "new_content": event["new_content"],
            "sender_id": event["sender_id"],
            "timestamp": event["timestamp"]
        }))


######################################################


    async def broadcast_presence(self, status):
        await self.broadcast({
            'type': 'presence',
            'user': await self.get_user_data(),
            'status': status,
            'timestamp': timezone.now().isoformat()
        })

    async def broadcast(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'data': data
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def get_user_data(self):
        if not hasattr(self, 'user') or not self.user:
            return None
            
        return {
            'id': str(self.user.id),
            'username': self.user.username,
            'is_online': self.user.is_online
        }

    @database_sync_to_async
    def is_user_guide(self):
        return (hasattr(self, 'conversation') and 
               self.conversation and 
               self.conversation.trip and 
               hasattr(self.user, 'admin') and 
               self.conversation.trip.guide == self.user.admin)

    @database_sync_to_async
    def create_message(self, content):
        try:
            message = Message.objects.create(
                conversation=self.conversation,
                sender=self.user,
                content=content
            )
            message.id = str(message.id)
            return message
        except Exception as e:
            print(f"Error creating message: {e}")
            return None

    @database_sync_to_async
    def mark_message_read(self, message_id):
        try:
            # Handle both string and UUID message_id
            message_uuid = uuid.UUID(message_id) if isinstance(message_id, str) else message_id
            message = Message.objects.get(
                id=message_uuid,
                conversation=self.conversation
            )
            if self.user not in message.read_by.all():
                message.read_by.add(self.user)
                message.save()
                return True
            return False
        except (Message.DoesNotExist, ValueError) as e:
            print(f"Error marking message read: {e}")
            return False
    
    
    @database_sync_to_async
    def _update_message_db(self, message_id, new_content):
        """Internal method using integer ID"""
        try:
            message = Message.objects.get(
                id=message_id,
                sender=self.user,  # Ensure ownership
                conversation=self.conversation
            )
            message.content = new_content
            message.save()
            return True
        except (Message.DoesNotExist, ValidationError):
            return False



    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.broadcast_presence('leave')
            await self.set_user_offline()
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)