"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from main.models import MessageDM, ConversationDM, Customer, Admin, User

class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        
        self.other_user = self.scope['url_route']['kwargs']['username']
        self.me = self.scope['user']
        
       
        self.thread_obj = await self.get_thread(self.me, self.other_user)
        self.chat_room = f"thread_{self.thread_obj.id}"

        
        await self.channel_layer.group_add(
            self.chat_room,
            self.channel_name
        )

        await self.accept()

    async def receive(self, text_data):
       
        data = json.loads(text_data)
        msg = data.get('message')
        
        if not msg:
            return

        user = self.scope['user']
        if not user.is_authenticated:
            return

        
        await self.create_chat_message(msg)

       
        my_response = {
            'message': msg,
            'username': user.username
        }

       
        await self.channel_layer.group_send(
            self.chat_room,
            {
                "type": "chat_message",
                "text": json.dumps(my_response)
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
    def get_thread(self, user, other_username):
        
        try:
            other_user = User.objects.get(username=other_username)
            return ConversationDM.objects.get(
                staff__user=user if isinstance(user, Admin) else other_user,
                cust__user=user if isinstance(user, Customer) else other_user
            )
        except ConversationDM.DoesNotExist:
            raise ValueError("Conversation does not exist.")

    @database_sync_to_async
    def create_chat_message(self, msg):
       
        me = self.scope['user']
        conversation = self.thread_obj

        
        if me == conversation.staff.user:
            receiver = conversation.cust.user
        else:
            receiver = conversation.staff.user

        return MessageDM.objects.create(
            conversation=conversation,
            sender=me,
            receiver=receiver,
            content=msg
        )

"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils.timezone import now
from channels.db import database_sync_to_async
from main.models import MessageDM, ConversationDM, User, Admin, Customer

class PrivateChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """Gère la connexion WebSocket"""
        self.other_user = self.scope['url_route']['kwargs']['username']
        self.me = self.scope['user']

        if not self.me.is_authenticated:
            await self.close()
            return
        
        self.conversation = await self.get_conversation(self.me, self.other_user)
        if not self.conversation:
            await self.close()
            return

        self.chat_room = f"conversation_{self.conversation.id}"

        await self.set_user_online()

        await self.channel_layer.group_add(self.chat_room, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        """Gère l'envoi, l'édition et la suppression des messages"""
        try:
            data = json.loads(text_data)
            action = data.get('action')

            if action == "send":
                await self.handle_send_message(data)
            elif action == "edit":
                await self.handle_edit_message(data)
            elif action == "delete":
                await self.handle_delete_message(data)
        except json.JSONDecodeError:
            return

    async def handle_send_message(self, data):
        """Gère l'envoi d'un nouveau message"""
        msg = data.get('message')

        if not msg or not self.me.is_authenticated:
            return

        message = await self.create_chat_message(msg)

        response = {
            'action': 'send',
            'message': msg,
            'username': self.me.username,
            'message_id': message.id,
        }

        await self.channel_layer.group_send(self.chat_room, {"type": "chat_message", "text": json.dumps(response)})

    async def handle_edit_message(self, data):
        """Gère l'édition d'un message"""
        message_id = data.get('message_id')
        new_content = data.get('new_content')

        if not message_id or not new_content or not self.me.is_authenticated:
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
        """Gère la suppression d'un message"""
        message_id = data.get('message_id')

        if not message_id or not self.me.is_authenticated:
            return

        success = await self.delete_message(message_id)

        if success:
            response = {'action': 'delete', 'message_id': message_id}
            await self.channel_layer.group_send(self.chat_room, {"type": "chat_message", "text": json.dumps(response)})

    async def chat_message(self, event):
        """Envoie un message WebSocket à tous les clients"""
        await self.send(text_data=event["text"])

    async def disconnect(self, close_code):
        """Gère la déconnexion WebSocket"""
        await self.set_user_offline()
        await self.channel_layer.group_discard(self.chat_room, self.channel_name)

    @database_sync_to_async
    def get_conversation(self, user, other_username):
        """Récupère une conversation existante entre deux utilisateurs"""
        try:
            other_user = User.objects.get(username=other_username)
            return ConversationDM.objects.filter(
                staff__user__in=[user, other_user],
                cust__user__in=[user, other_user]
            ).first()
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def create_chat_message(self, msg):
        """Crée et enregistre un nouveau message"""
        conversation = self.conversation
        receiver = conversation.cust.user if self.me == conversation.staff.user else conversation.staff.user

        return MessageDM.objects.create(conversation=conversation, sender=self.me, receiver=receiver, content=msg)

    @database_sync_to_async
    def edit_message(self, message_id, new_content):
        """Modifie un message si l'utilisateur est le propriétaire"""
        try:
            message = MessageDM.objects.get(id=message_id, sender=self.me)
            message.content = new_content
            message.save()
            return True
        except MessageDM.DoesNotExist:
            return False

    @database_sync_to_async
    def delete_message(self, message_id):
        """Supprime un message si l'utilisateur est le propriétaire"""
        try:
            message = MessageDM.objects.get(id=message_id, sender=self.me)
            message.delete()
            return True
        except MessageDM.DoesNotExist:
            return False

    @database_sync_to_async
    def set_user_online(self):
        """Marque l'utilisateur comme en ligne"""
        self.me.is_online = True
        self.me.save()

    @database_sync_to_async
    def set_user_offline(self):
        """Marque l'utilisateur comme hors ligne et met à jour sa dernière activité"""
        self.me.is_online = False
        self.me.last_seen = now()
        self.me.save()
