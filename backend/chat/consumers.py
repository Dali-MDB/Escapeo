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
from datetime import datetime

from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
from channels.db import database_sync_to_async
from django.db.models import Q
from .models import DirectConversation, GroupConversation, Message, SupportTicket
from main.models import User

class BaseChatConsumer(AsyncWebsocketConsumer):
    
    async def send_error(self, message, code=None):
        
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
        
        self.user.is_online = True
        self.user.last_seen = timezone.now()
        self.user.save()

    @database_sync_to_async
    def set_user_offline(self):
        
        self.user.is_online = False
        self.user.last_seen = timezone.now()
        self.user.save()

class PrivateChatConsumer(BaseChatConsumer):
   

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close(code=4001)
            return
        
        self.conversation = await self.get_authorized_conversation()
        if not self.conversation:
            await self.send_error("Conversation not accessible", code="no_access")
            await self.close(code=4003)
            return

        self.room_group_name = f"private_{self.conversation_id}"
        await self.set_user_online()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
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

        if self.conversation.ticket and not await self.validate_ticket():
            return await self.send_error("Support ticket is closed", code="ticket_closed")

        message_obj = await self.create_message(message)
        await self.broadcast({
            'type': 'message',
            'id': message_obj.id,
            'sender': await self.get_user_data(),
            'content': message,
            'timestamp': message_obj.timestamp.isoformat(),
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
        
        return {
            'id': self.user.id,
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
                conversation=self.conversation,
                read=False
            )
            if message.sender != self.user:
                message.read = True
                message.save()
                return True
        except Message.DoesNotExist:
            return False

    async def disconnect(self, close_code):
        
        if hasattr(self, 'room_group_name'):
            await self.broadcast_presence('offline')
            await self.set_user_offline()
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

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