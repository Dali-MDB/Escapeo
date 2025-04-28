"""
from datetime import timezone
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils.timezone import now
from channels.db import database_sync_to_async
from main.models import MessageDM, ConversationDM, User, Admin, Customer, GroupChatConversation, MessageGroup, GroupMessageReadStatus, SupportTicket, Trip
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class PrivateChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.other_user_username = self.scope['url_route']['kwargs']['username']
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.conversation = await self.get_or_create_conversation()
        if not self.conversation:
            await self.close()
            return

        self.chat_room = f"conversation_{self.conversation.id}"

        await self.set_user_online()

        await self.channel_layer.group_add(self.chat_room, self.channel_name)
        await self.accept()


    

    @database_sync_to_async
    def get_or_create_conversation(self):
        try:
            other_user = User.objects.get(username=self.other_user_username)

            if hasattr(self.user, 'admin'):
                current_admin = self.user.admin
                other_customer = other_user.customer

                if current_admin.department == 'tour_guide':

                    conversation, created = ConversationDM.objects.get_or_create(
                        staff = current_admin,
                        cust=other_customer,
                        conversation_type='direct'
                    )
                    return conversation
                elif current_admin.department == 'customer_support':
                    ticket = SupportTicket.objects.filter(
                        customer = other_customer,
                        accepted_by=current_admin,
                        status='accepted'
                    ).first()
                    if ticket:
                        conversation, created = ConversationDM.objects.get_or_create(
                            staff=current_admin,
                            cust = other_customer,
                            ticket=ticket,
                            conversation_type='support'
                        )
                        return conversation
                elif hasattr(self.user,'customer'):
                      current_customer = self.user.customer
                other_admin = other_user.admin
                
                if other_admin.department == 'tour_guide':
                    
                    conversation, created = ConversationDM.objects.get_or_create(
                        staff=other_admin,
                        cust=current_customer,
                        conversation_type='direct'
                    )
                    return conversation
                elif other_admin.department == 'customer_support':
                    # Support conversation - must have accepted ticket
                    ticket = SupportTicket.objects.filter(
                        customer=current_customer,
                        accepted_by=other_admin,
                        status='accepted'
                    ).first()
                    if ticket:
                        conversation, created = ConversationDM.objects.get_or_create(
                            staff=other_admin,
                            cust=current_customer,
                            ticket=ticket,
                            conversation_type='support'
                        )
                        return conversation
        except (User.DoesNotExist, AttributeError):
            pass
        return None





    async def receive(self, text_data):
        
        try:
            data = json.loads(text_data)
            action = data.get('action')

            if action == "send":
                await self.handle_send_message(data)
            elif action == "edit":
                await self.handle_edit_message(data)
            elif action == "delete":
                await self.handle_delete_message(data)
            elif action == "typing":
                await self.handle_typing_indicator(data)
            elif action == "read":
                await self.handle_read_receipt(data)
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON Format")
    
    
    async def handle_read_receipt(self,data):
        message_id = data.get('message_id')
        if not message_id:
            return

        success = await self.mark_message_as_read(message_id)
        if success:
            await self.update_unread_count()

            response = {
                'action': 'read',
                'message_id': message_id,
                'reader_id': self.user.id,
                'read_at': now().isoformat()
            } 
            await self.channel_layer.group_send(
                 self.chat_room,
                {
                    "type": "chat.read",
                    "text": json.dumps(response)
                }
            )

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = MessageDM.objects.get(
                id=message_id,
                receiver=self.user
            )
            return message.mark_as_read(self.user)
        except MessageDM.DoesNotExist:
            return False

    @database_sync_to_async
    def update_unread_count(self):
        self.conversation.refresh_from_db()



    async def handle_typing_indicator(self, data):
        await self.channel_layer.group_send(
            self.chat_room,
            {
                "type":"chat.typing",
                "username": self.user.username,
                "is_typing":data.get('is_typing', False)
            }
        )

    async def chat_typing(self, event):
        await self.send(text_data=json.dumps({
            'action':'typing',
            'username':event['username'],
            'is_typing':event['is_typing']    
        
        }))

    async def handle_send_message(self, data):

        if not self.conversation:
            return
        
        if self.conversation.conversation_type == 'support':
            ticket_valid = await self.validate_ticket()
            if not ticket_valid:
                await self.send_error("This support ticket is no longer active")
                return


        
        msg = data.get('message')

        if not msg or not self.user.is_authenticated:
            return

        message_obj = await self.create_chat_message(msg)

        response = {
            'action': 'message',
            'id':message_obj.id,
            'sender':self.user.username,
            'content': msg,
            'sent_at': message_obj.sent_at.isoformat(),
            'conversation_type':self.conversation.conversation_type
        }

        await self.channel_layer.group_send(
            self.chat_room, 
            {"type": "chat_message", 
             "text": json.dumps(response)
             }
        )


    @database_sync_to_async
    def validate_ticket(self):
        if not self.conversation.ticket:
            return False
        self.conversation.ticket.refresh_from_db()
        return self.conversation.ticket.status == 'accepted'    
    


    async def handle_edit_message(self, data):
        
        message_id = data.get('message_id')
        new_content = data.get('new_content')

        if not message_id or not new_content or not self.user.is_authenticated:
            return

        success = await self.edit_message(message_id, new_content)

        if success:
            response = {
                'action': 'edit',
                'message_id': message_id,
                'new_content': new_content,
            }
            await self.channel_layer.group_send(self.chat_room, {"type": "chat_message", "text": json.dumps(response)})

    async def handle_delete_message(self, data):
        
        message_id = data.get('message_id')

        if not message_id or not self.user.is_authenticated:
            return

        success = await self.delete_message(message_id)

        if success:
            response = {'action': 'delete', 'message_id': message_id}
            await self.channel_layer.group_send(self.chat_room, {"type": "chat_message", "text": json.dumps(response)})

    async def chat_message(self, event):
        
        await self.send(text_data=event["text"])

    async def disconnect(self, close_code):
       
        await self.set_user_offline()
        await self.channel_layer.group_discard(self.chat_room, self.channel_name)

    @database_sync_to_async
    def get_conversation(self, user, other_username):
        
        try:
            other_user = User.objects.get(username=other_username)
            return ConversationDM.objects.filter(
                staff__user__in=[user, other_user],
                cust__user__in=[user, other_user]
            ).first()
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def create_chat_message(self, content):
        return MessageDM.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content=content
        )


    async def send_error(self, message):
        await self.send(text_data=json.dumps({
            'error':message
        }))


    @database_sync_to_async
    def edit_message(self, message_id, new_content):
        
        try:
            message = MessageDM.objects.get(id=message_id, sender=self.user)
            message.content = new_content
            message.save()
            return True
        except MessageDM.DoesNotExist:
            return False

    @database_sync_to_async
    def delete_message(self, message_id):
       
        try:
            message = MessageDM.objects.get(id=message_id, sender=self.user)
            message.delete()
            return True
        except MessageDM.DoesNotExist:
            return False

    @database_sync_to_async
    def set_user_online(self):
        
        self.user.is_online = True
        self.user.save()

    @database_sync_to_async
    def set_user_offline(self):
       
        self.user.is_online = False
        self.user.last_seen = now()
        self.user.save()



#---------------------------GROUPCHAT------------------------------

class GroupChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        has_access = await self.validate_user_access()
        if not has_access:
            await self.close()
            return
        
        self.conversation = await self.get_group_conversation(self.group_id)
        if not self.conversation:
            await self.close()
            return

        self.chat_room = f"group_chat_{self.group_id}"

        await self.channel_layer.group_add(
            self.chat_room,
            self.channel_name
        )

        await self.accept()

    @database_sync_to_async
    def validate_user_access(self):
        try:
            trip = Trip.objects.get(id=self.trip_id)

            if hasattr(self.user, 'admin') and trip.guide:
                if self.user.admin.id == trip.guide.id:
                    return True


            if hasattr(self.user, 'customer'):
                return trip.purchasers.filter(id=self.user.customer.id).exists()

        except(Trip.DoesNotExist, AttributeError):
            pass
        return False    


    async def receive(self, text_data):
        
        data = json.loads(text_data)
        action = data.get('action')

        if action == "send":
            await self.handle_send_message(data)
        elif action == "edit":
            await self.handle_edit_message(data)
        elif action == "delete":
            await self.handle_delete_message(data)
        elif action == "read":
                await self.handle_group_read_receipt(data)

              
    async def handle_group_read_receipt(self, data):
        message_id = data.get('message_id')
        if not message_id:
            return

        success = await self.mark_group_message_as_read(message_id)
        if success:
            response = {
                'action': 'group_read',
                'message_id': message_id,
                'reader_id': self.user.id,
                'read_at': timezone.now().isoformat()
            }
            await self.channel_layer.group_send(
                self.chat_room,
                {
                    "type": "chat.group_read",
                    "text": json.dumps(response)
                }
            )

    @database_sync_to_async
    def mark_group_message_as_read(self, message_id):
        try:
            message = MessageGroup.objects.get(id=message_id)

            if self.user not in message.group.participants.all():
                return

            async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                'type': 'group_message_read',
                'message_id': message.id,
                'read_by': list(message.read_by.values_list('id', flat=True)),
                'read_at': now().isoformat(),
            })
           
        except MessageGroup.DoesNotExist:
            return 

    async def chat_group_read(self, event):
       
        await self.send(text_data=event["text"])


    async def handle_send_message(self, data):
      
        msg = data.get('message')

        if not msg:
            return

        message = await self.create_group_message(msg)
        is_guide = await self.is_user_guide()

        response = {
            'action': 'send',
            'message': msg,
            'username': self.user.username,
            'message_id': message.id,
            'sender_id':self.user.id,
            'is_guide':is_guide,
            'sent_at':message.sent_at.isoformat()
        }

        await self.channel_layer.group_send(
            self.chat_room,
            {
                "type": "chat_message",
                "text": json.dumps(response)
            }
        )

    
    @database_sync_to_async
    def is_user_guide(self):
        try:
            if hasattr(self.user, 'admin') and self.conversation.trip.guide:
                return self.user.admin.id == self.conversation.trip.guide.id
        except AttributeError:
            pass
        return False


    async def handle_edit_message(self, data):
       
        message_id = data.get('message_id')
        new_content = data.get('new_content')

        if not message_id or not new_content:
            return

        success = await self.edit_group_message(message_id, new_content)

        if success:
            response = {
                'action': 'edit',
                'message_id': message_id,
                'new_content': new_content,
            }

            await self.channel_layer.group_send(
                self.chat_room,
                {
                    "type": "chat_message",
                    "text": json.dumps(response)
                }
            )

    async def handle_delete_message(self, data):
        
        message_id = data.get('message_id')

        if not message_id:
            return

        success = await self.delete_group_message(message_id)

        if success:
            response = {
                'action': 'delete',
                'message_id': message_id,
            }

            await self.channel_layer.group_send(
                self.chat_room,
                {
                    "type": "chat_message",
                    "text": json.dumps(response)
                }
            )

    async def chat_message(self, event):
       
        await self.send(text_data=event["text"])

    async def disconnect(self, close_code):
        
        await self.channel_layer.group_discard(
            self.chat_room,
            self.channel_name
        )

    @database_sync_to_async
    def get_group_conversation(self, group_id):
       
        try:
            conversation = GroupChatConversation.objects.get(id=group_id)
            trip = conversation.trip

            if hasattr(self.user, 'admin') and trip.guide:
                if self.user.admin.id == trip.guide.id:
                    return conversation
            
            if hasattr(self.user,'customer'):
                if trip.purchasers.filter(id=self.user.customer.id).exists():
                    return conversation



        except GroupChatConversation.DoesNotExist:
            pass
        return None

    @database_sync_to_async
    def create_group_message(self, msg):
        
        return MessageGroup.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content=msg
        )

    @database_sync_to_async
    def edit_group_message(self, message_id, new_content):
       
        try:
            message = MessageGroup.objects.get(id=message_id, sender=self.user)
            message.content = new_content
            message.save()
            return True
        except MessageGroup.DoesNotExist:
            return False

    @database_sync_to_async
    def delete_group_message(self, message_id):
        
        try:
            message = MessageGroup.objects.get(id=message_id, sender=self.user)
            message.delete()
            return True
        except MessageGroup.DoesNotExist:
            return False
"""
"""
from datetime import timezone
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils.timezone import now
from channels.db import database_sync_to_async
from django.db.models import Q
from .models import DirectConversation, Message, SupportTicket, GroupConversation
from main.models import User

class PrivateChatConsumer(AsyncWebsocketConsumer):
   

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close(code=4001)  # Unauthorized
            return
        
        self.conversation = await self.get_authorized_conversation()
        if not self.conversation:
            await self.send_error("Conversation not found or access denied")
            await self.close(code=4003)  # Forbidden
            return

        self.chat_room = f"direct_conversation_{self.conversation.id}"
        await self.set_user_online()
        await self.channel_layer.group_add(self.chat_room, self.channel_name)
        await self.accept()

    @database_sync_to_async
    def get_authorized_conversation(self):
        
        return DirectConversation.objects.filter(
            Q(id=self.conversation_id),
            Q(customer=self.user) | Q(admin=self.user),
            is_active=True
        ).select_related('customer', 'admin', 'ticket').first()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')

            if action == "send":
                await self.handle_send_message(data)
            elif action == "edit":
                await self.handle_edit_message(data)
            elif action == "delete":
                await self.handle_delete_message(data)
            elif action == "typing":
                await self.handle_typing_indicator(data)
            elif action == "read":
                await self.handle_read_receipt(data)
        except json.JSONDecodeError:
            await self.send_error("Invalid message format")

    async def handle_send_message(self, data):
        
        if not self.conversation:
            await self.send_error("Conversation not found")
            return
        
        # For support tickets, validate ticket status
        if self.conversation.ticket is not None:
            ticket_valid = await self.validate_ticket()
            if not ticket_valid:
                await self.send_error("This support ticket is no longer active")
                return

        msg = data.get('message', '').strip()
        if not msg:
            await self.send_error("Message cannot be empty")
            return

        message_obj = await self.create_chat_message(msg)

        response = {
            'action': 'message',
            'id': message_obj.id,
            'sender': self.user.username,
            'content': msg,
            'timestamp': message_obj.timestamp.isoformat(),  # Changed from sent_at to timestamp
            'is_support': self.conversation.ticket is not None
        }

        await self.channel_layer.group_send(
            self.chat_room, 
            {
                "type": "chat_message", 
                "text": json.dumps(response)
            }
        )

    @database_sync_to_async
    def validate_ticket(self):
       
        if self.conversation.ticket is None:
            return False
        self.conversation.ticket.refresh_from_db()
        return self.conversation.ticket.status in ['open', 'claimed']

    async def handle_read_receipt(self, data):
       
        message_id = data.get('message_id')
        if not message_id:
            return

        success = await self.mark_message_as_read(message_id)
        if success:
            await self.update_unread_count()

            response = {
                'action': 'read',
                'message_id': message_id,
                'reader_id': self.user.id,
                'read_at': now().isoformat()
            }
            await self.channel_layer.group_send(
                self.chat_room,
                {
                    "type": "chat.read",
                    "text": json.dumps(response)
                }
            )

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        
        try:
            message = Message.objects.get(
                id=message_id,
                conversation=self.conversation,
                read=False
            )
            if message.sender != self.user:  # Don't mark own messages as read
                message.read = True
                message.save()
                return True
        except Message.DoesNotExist:
            return False
        return False

    @database_sync_to_async
    def update_unread_count(self):
        
        self.conversation.refresh_from_db()

    async def handle_typing_indicator(self, data):
        
        await self.channel_layer.group_send(
            self.chat_room,
            {
                "type": "chat.typing",
                "username": self.user.username,
                "is_typing": data.get('is_typing', False)
            }
        )

    async def chat_typing(self, event):
        
        await self.send(text_data=json.dumps({
            'action': 'typing',
            'username': event['username'],
            'is_typing': event['is_typing']
        }))

    async def handle_edit_message(self, data):
       
        message_id = data.get('message_id')
        new_content = data.get('new_content', '').strip()

        if not message_id or not new_content:
            await self.send_error("Invalid edit request")
            return

        success = await self.edit_message(message_id, new_content)
        if success:
            response = {
                'action': 'edit',
                'message_id': message_id,
                'new_content': new_content,
            }
            await self.channel_layer.group_send(
                self.chat_room, 
                {
                    "type": "chat_message", 
                    "text": json.dumps(response)
                }
            )

    async def handle_delete_message(self, data):
        
        message_id = data.get('message_id')

        if not message_id:
            await self.send_error("Invalid message ID")
            return

        success = await self.delete_message(message_id)
        if success:
            response = {
                'action': 'delete', 
                'message_id': message_id
            }
            await self.channel_layer.group_send(
                self.chat_room, 
                {
                    "type": "chat_message", 
                    "text": json.dumps(response)
                }
            )

    async def chat_message(self, event):
        
        await self.send(text_data=event["text"])

    async def disconnect(self, close_code):
       
        await self.set_user_offline()
        await self.channel_layer.group_discard(self.chat_room, self.channel_name)

    @database_sync_to_async
    def create_chat_message(self, content):
        
        return Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content=content
        )

    @database_sync_to_async
    def edit_message(self, message_id, new_content):
        
        try:
            message = Message.objects.get(id=message_id, sender=self.user)
            message.content = new_content
            message.save()
            return True
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def delete_message(self, message_id):
        
        try:
            message = Message.objects.get(id=message_id, sender=self.user)
            message.delete()
            return True
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def set_user_online(self):
        
        self.user.is_online = True
        self.user.save()

    @database_sync_to_async
    def set_user_offline(self):
        
        self.user.is_online = False
        self.user.last_seen = now()
        self.user.save()

    async def send_error(self, message):
        
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

class GroupChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['group_id']
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close(code=4001)  # Unauthorized
            return

        self.conversation = await self.get_authorized_conversation()
        if not self.conversation:
            await self.send_error("Group conversation not found or access denied")
            await self.close(code=4003)  # Forbidden
            return

        if not await self.validate_guide_presence():
            await self.send_error("Group conversation must have a guide")
            await self.close(code=4003)
            return

        # Consistent naming convention (matches private chat pattern)
        self.room_group_name = f"group_conversation_{self.conversation_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Notify group about new participant
        await self.broadcast_presence('join')

    @database_sync_to_async
    def get_authorized_conversation(self):
       
        return GroupConversation.objects.filter(
            id=self.conversation_id,
            participants=self.user
        ).select_related('trip', 'trip__guide').prefetch_related('participants').first()

    @database_sync_to_async
    def validate_guide_presence(self):
        
        return (self.conversation.trip.guide and 
                self.conversation.trip.guide.user in self.conversation.participants.all())

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')

            if action == "send":
                await self.handle_send_message(data)
            elif action == "edit":
                await self.handle_edit_message(data)
            elif action == "delete":
                await self.handle_delete_message(data)
            elif action == "read":
                await self.handle_read_receipt(data)
            elif action == "typing":
                await self.handle_typing_indicator(data)
            elif action == "presence":
                await self.handle_presence_update(data)
        except json.JSONDecodeError:
            await self.send_error("Invalid message format")

    async def handle_send_message(self, data):
        
        msg = data.get('message', '').strip()
        if not msg:
            await self.send_error("Message cannot be empty")
            return

        message_obj = await self.create_message(msg)
        is_guide = await self.is_user_guide()

        response = {
            'action': 'message',
            'id': message_obj.id,
            'sender': {
                'id': self.user.id,
                'username': self.user.username,
                'is_guide': is_guide
            },
            'content': msg,
            'timestamp': message_obj.timestamp.isoformat(),
            'conversation_id': self.conversation_id
        }

        await self.broadcast(response)

    async def handle_typing_indicator(self, data):
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.typing",
                "user_id": self.user.id,
                "username": self.user.username,
                "is_typing": data.get('is_typing', False)
            }
        )

    async def handle_read_receipt(self, data):
       
        message_id = data.get('message_id')
        if not message_id:
            return

        if await self.mark_message_read(message_id):
            await self.broadcast({
                'action': 'read_receipt',
                'message_id': message_id,
                'reader_id': self.user.id,
                'timestamp': now().isoformat()
            })

    async def handle_edit_message(self, data):
        
        message_id = data.get('message_id')
        new_content = data.get('new_content', '').strip()

        if not message_id or not new_content:
            await self.send_error("Invalid edit request")
            return

        if await self.edit_message(message_id, new_content):
            await self.broadcast({
                'action': 'edit',
                'message_id': message_id,
                'new_content': new_content
            })

    async def handle_delete_message(self, data):
       
        message_id = data.get('message_id')
        if not message_id:
            await self.send_error("Invalid message ID")
            return

        if await self.delete_message(message_id):
            await self.broadcast({
                'action': 'delete',
                'message_id': message_id
            })

    async def handle_presence_update(self, data):
        
        status = data.get('status')
        if status in ['online', 'away']:
            await self.broadcast_presence(status)

    async def broadcast_presence(self, status):
        
        await self.broadcast({
            'action': 'presence',
            'user_id': self.user.id,
            'username': self.user.username,
            'status': status,
            'timestamp': now().isoformat()
        })

    async def broadcast(self, data):
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'text': json.dumps(data)
            }
        )

    async def chat_message(self, event):
        
        await self.send(text_data=event['text'])

    async def chat_typing(self, event):
        
        await self.send(text_data=json.dumps({
            'action': 'typing',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_typing': event['is_typing']
        }))

    @database_sync_to_async
    def is_user_guide(self):
        
        if not hasattr(self.user, 'admin'):
            return False
        return self.conversation.trip.guide == self.user.admin

    @database_sync_to_async
    def create_message(self, content):
        
        return Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content=content
        )

    @database_sync_to_async
    def mark_message_read(self, message_id):
        
        try:
            message = Message.objects.get(
                id=message_id,
                conversation=self.conversation
            )
            if self.user not in message.read_by.all():
                message.read_by.add(self.user)
                message.save()
                return True
        except Message.DoesNotExist:
            return False
        return False

    @database_sync_to_async
    def edit_message(self, message_id, new_content):
        
        try:
            message = Message.objects.get(
                id=message_id,
                sender=self.user,
                conversation=self.conversation
            )
            message.content = new_content
            message.save()
            return True
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def delete_message(self, message_id):
        
        try:
            message = Message.objects.get(
                id=message_id,
                sender=self.user,
                conversation=self.conversation
            )
            message.delete()
            return True
        except Message.DoesNotExist:
            return False

    async def disconnect(self, close_code):
        
        await self.broadcast_presence('leave')
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def send_error(self, message):
        
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))
"""
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
from rest_framework_simplejwt.tokens import AccessToken, TokenError
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from urllib.parse import parse_qs

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

   # async def connect(self):
        # Extract JWT token from headers
    #    self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
     #   self.user = await self.authenticate_user()
      #  
       # if not self.user or not self.user.is_authenticated:
        #    await self.close(code=4001)  # Unauthorized
         #   return

        #self.conversation = await self.get_authorized_conversation()
        #if not self.conversation:
         #   await self.close(code=4003)  # Forbidden
          #  return

        #self.room_group_name = f"private_{self.conversation_id}"
        #await self.set_user_online()
        #await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        #await self.accept()
        #await self.broadcast_presence('online')

    #@database_sync_to_async
    #def authenticate_user(self):
     #   """Validate JWT token and return user"""
      #  try:
       #     headers = dict(self.scope["headers"])
        #    if b'authorization' in headers:
         #       token = headers[b'authorization'].decode().split()[1]
          #      access_token = AccessToken(token)
           #     return User.objects.get(id=access_token['user_id'])
        #except Exception as e:
         #   print(f"Authentication error: {e}")
          #  return None
    #@database_sync_to_async
    #def get_authorized_conversation(self):
     #   """Get conversation with UUIDs converted to string"""
      #  conversation = DirectConversation.objects.filter(
       #     Q(id=self.conversation_id),
        #    Q(customer=self.user) | Q(admin=self.user),
         #   is_active=True
        #).select_related('customer', 'admin', 'ticket').first()
        #if conversation:
         #   conversation.id = str(conversation.id)
          #  if conversation.ticket:
           #     conversation.ticket.id = str(conversation.ticket.id)
            #if conversation.customer:
             #   conversation.customer.id = str(conversation.customer.id)
            #if conversation.admin:
             #   conversation.admin.id = str(conversation.admin.id)
        #return conversation

    async def connect(self):
        # Extract JWT token from headers or URL
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
        token = self._get_token_from_headers() or self._get_token_from_query()

        if not token:
            return None

        try:
            access_token = AccessToken(token)
            user = User.objects.get(id=access_token['user_id'])
            return user
        except (TokenError, User.DoesNotExist) as e:
            print(f"Authentication error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error: {e}")
            return None

    def _get_token_from_headers(self):
        """Extract JWT token from the Authorization header"""
        headers = dict(self.scope["headers"])
        auth_header = headers.get(b'authorization', b'').decode()
        if auth_header.lower().startswith('bearer '):
            return auth_header[7:].strip()
        return None

    def _get_token_from_query(self):
        """Extract JWT token from the URL query string"""
        query_string = self.scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token_list = params.get('token')
        if token_list:
            return token_list[0].strip()
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




    """
    async def handle_edit(self, data):
        
        try:
            message_id_str = data.get("message_id")  # Always received as string
            new_content = data.get("new_content")

        # Validate inputs
            if not message_id_str:
                await self.send_error("Missing message_id", code="invalid_data")
                return
            if not new_content or not isinstance(new_content, str):
                await self.send_error("Invalid message content", code="invalid_data")
                return
            if len(new_content) > 2000:
                await self.send_error("Message too long (max 2000 chars)", code="message_too_long")
                return

        # Update message (pass string ID to DB method)
            success = await self._update_message_db(message_id_str, new_content)
            if not success:
                await self.send_error("Message not found or not authorized", code="edit_failed")
                return

        # Broadcast edit (using original string ID)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat.message_edited",
                    "message_id": message_id_str,  # Keep as string
                    "new_content": new_content,
                    "sender_id": str(self.user.id),
                    "timestamp": timezone.now().isoformat()
                }
            )

        except Exception as e:
            await self.send_error(f"Server error: {str(e)}", code="server_error")
    """

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
"""
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
        return GroupConversation.objects.filter(
            id=self.group_id,
            participants=self.user
        ).select_related('trip', 'trip__guide').prefetch_related('participants').first()

    @database_sync_to_async
    def validate_guide_presence(self):
        return (self.conversation.trip.guide and 
                self.conversation.trip.guide.user in self.conversation.participants.all())

    @database_sync_to_async
    def get_participants_data(self):
        
        participants = []
        for user in self.conversation.participants.all().select_related('admin'):
            participants.append({
                'id': user.id,
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

    async def handle_send(self, data):
        
        message = data.get('message', '').strip()
        
        if not message:
            return await self.send_error("Message cannot be empty", code="empty_message")
        if len(message) > 2000:
            return await self.send_error("Message too long (max 2000 chars)", code="message_too_long")

        message_obj = await self.create_message(message)
        await self.broadcast({
            'type': 'message',
            'id': message_obj.id,
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
        
        return {
            'id': self.user.id,
            'username': self.user.username,
            'is_online': self.user.is_online
        }

    @database_sync_to_async
    def is_user_guide(self):
        return hasattr(self.user, 'admin') and self.conversation.trip.guide == self.user.admin

    @database_sync_to_async
    def create_message(self, content):
        
        return Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content=content
        )

    @database_sync_to_async
    def mark_message_read(self, message_id):
        
        try:
            message = Message.objects.get(
                id=message_id,
                conversation=self.conversation
            )
            if self.user not in message.read_by.all():
                message.read_by.add(self.user)
                message.save()
                return True
        except Message.DoesNotExist:
            return False

    async def disconnect(self, close_code):
        
        if hasattr(self, 'room_group_name'):
            await self.broadcast_presence('leave')
            await self.set_user_offline()
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
"""
import json
import uuid
from django.utils import timezone
from channels.db import database_sync_to_async
from .models import GroupConversation, Message
from django.contrib.auth import get_user_model
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()

class GroupChatConsumer(BaseChatConsumer):
    """"
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
    """
    async def connect(self):
    # Step 1: Accept the WebSocket connection before sending any messages
        await self.accept()

    # Step 2: Extract the token from the WebSocket URL or headers
        token = self._extract_token()
        if not token:
            await self._close_with_error("No token provided", code=4001)
            return

    # Step 3: Authenticate the user using the token
        try:
            self.user = await self.authenticate_user(token)
            if not self.user:
                await self._close_with_error("Invalid token", code=4001)
                return
        except Exception as e:
            await self._close_with_error(f"Authentication failed: {str(e)}", code=4001)
            return

    # Step 4: Validate group access
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.conversation = await self.get_authorized_conversation()

        if not self.conversation:
            await self.send_error("Access denied to group", code="no_access")
            await self.close(code=4003)
            return

    # Step 5: Finalize connection setup
        self.room_group_name = f"group_{self.group_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.set_user_online()

    def _extract_token(self):
        """Extract JWT from headers or query string (fallback)"""
        headers = dict(self.scope.get("headers", {}))
    
        # First, check for Authorization header
        if b'authorization' in headers:
            auth_header = headers[b'authorization'].decode()
            if auth_header.startswith('Bearer '):
                return auth_header.split(' ')[1]
    
    # If no Authorization header, check the query string for token
        query_string = self.scope.get('query_string', b'').decode()
        if 'token=' in query_string:
            token = query_string.split('token=')[1].split('&')[0]  # Get token from query string
            return token
    
        return None

    @database_sync_to_async
    def authenticate_user(self, token):
        """Validate JWT and return user"""
        try:
            auth = JWTAuthentication()
            validated_token = auth.get_validated_token(token)
            return auth.get_user(validated_token)
        except (InvalidToken, TokenError) as e:
            print(f"JWT validation failed: {e}")
            return None

    @database_sync_to_async
    def get_authorized_conversation(self):
        """Check if user belongs to the group"""
        return GroupConversation.objects.filter(
            id=self.group_id,
            participants__id=self.user.id  # Explicit membership check
        ).first()

    async def _close_with_error(self, message, code=4000):
        """Safely close connection with error (pre-accept)"""
        await self.send_error(message, code="auth_error")
        await self.close(code=code)


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



    
    """
    async def handle_edit(self, data):
        message_id = data.get("message_id")
        new_content = data.get("new_content")

        # Validate inputs
        if not message_id:
            await self.send_error("Missing message_id", code="invalid_data")
            return
        if not new_content or not isinstance(new_content, str):
            await self.send_error("Invalid message content", code="invalid_data")
            return
        if len(new_content) > 2000:
            await self.send_error("Message too long (max 2000 chars)", code="message_too_long")
            return

        updated_message = await self.update_message(message_id, new_content)
        if not updated_message:
            await self.send_error("Message not found or not authorized", code="edit_failed")
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message_edited",
                "message_id": str(updated_message.id),
                "new_content": updated_message.content,
                "sender_id": str(updated_message.sender.id),
                "timestamp": updated_message.timestamp.isoformat(),
            }
        )


    async def handle_read(self, data):
        message_id = data.get('message_id')
        if message_id and await self.mark_message_read(message_id):
            await self.broadcast({
                'type': 'read_receipt',
                'message_id': message_id,
                'reader': await self.get_user_data(),
                'timestamp': timezone.now().isoformat()
            })


    async def chat_message_edited(self, event):
        await self.send_json({
            "type": "edit",
            "message_id": event["message_id"],
            "new_content": event["new_content"],
            "sender_id": event["sender_id"],
            "timestamp": event["timestamp"],
        })
    """
    """
    async def handle_edit(self, data):
        try:
            message_id_str = data.get("message_id")  # Get as string
            new_content = data.get("new_content")

            if not message_id_str or not new_content:
                await self.send_json({
                    "type": "error",
                    "code": "invalid_input",
                    "message": "Missing message_id or content"
                })
                return

            # Convert to UUID only for database operations
            try:
                message_uuid = uuid.UUID(message_id_str)
            except ValueError:
                await self.send_json({
                    "type": "error",
                    "code": "invalid_id",
                    "message": "Invalid message ID format"
                })
                return

            updated = await self._update_message_db(message_uuid, new_content)
            if not updated:
                await self.send_json({
                    "type": "error",
                    "code": "edit_failed", 
                    "message": "Message not found or not authorized"
                })
                return

            # Broadcast using string ID
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat.message_edited",
                    "message_id": message_id_str,  # Keep as string
                    "new_content": new_content,
                    "sender_id": str(self.user.id),
                    "timestamp": timezone.now().isoformat()
                }
            )

        except Exception as e:
            await self.send_json({
                "type": "error",
                "code": "server_error",
                "message": str(e)
            })

    async def chat_message_edited(self, event):
       
        await self.send_json({
            "type": "message_edited",
            "message_id": event["message_id"],  # Already string
            "new_content": event["new_content"],
            "sender_id": event["sender_id"],  # Already string
            "timestamp": event["timestamp"]
        })
    """


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
    
    """
    @database_sync_to_async
    def update_message(self, message_id, new_content):
        try:
            message = Message.objects.get(id=message_id, conversation=self.conversation)
            if message.sender != self.user:
                return None

            message.content = new_content
            message.save()
            return message
        except Message.DoesNotExist:
            return None
    """

    """
    @database_sync_to_async
    def _update_message_db(self, message_uuid, new_content):
        
        try:
            message = Message.objects.get(
                id=message_uuid,
                sender=self.user,  # Ensure ownership
                conversation=self.conversation
            )
            message.content = new_content
            message.save()
            return True
        except (Message.DoesNotExist, ValidationError):
            return False
    """


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