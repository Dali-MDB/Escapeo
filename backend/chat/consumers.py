
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