"""
import asyncio
import json
from django.contrib.auth import get_user_model
from channels.consumer import AsyncConsumer

from channels.db import database_sync_to_async

from .models import Thread 
from main.models import MessageDM, ConversationDM, Customer, Admin, User

class ChatConsumer(AsyncConsumer):
    async def websocket_connect(self, event):
      await self.send({
         "type":"websocket.accept"
      })
      other_user = self.scope['url_route']['kwargs']['username']
      me = self.scope['user']
      thread_obj = await self.get_thread(me,other_user)
      self.thread_obj = thread_obj
      chat_room = f"thread_{thread_obj.id}".format()  
      self.chat_room = chat_room
      await self.channel_layer.group_add(
         chat_room,
         self.channel_name
      )

      await self.send({
         "type":"websocket.accept"
      })

    async def websocket_receive(self, event):
        front_text = event.get('text', None)
        if front_text is not None:
           loaded_dict_data = json.loads(front_text)
           msg = loaded_dict_data.get('message')
           user = self.scope['user']
           username = 'default'
           if user.is_authentaticated:
              username = user.username
           myResponse={
                'message':msg,
                'username':username   
            }
            
           await self.create_chat_message(msg) 

           await self.channel_layer.group_send(
              self.chat_room,
              {
                 "type":"chat_message",
                 "text": json.dumps(myResponse)
              }
           )

    async def chat_message(self,event):
       await self.send({
          "type":"websocket.send",
          "text": event['text']  
       })
       
       

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.chat_room,
            self.channel_name
        )

    @database_sync_to_async
    def get_thread(self, user,other_username):
       return Thread.objects.get_or_new(user,other_username)[0]

    @database_sync_to_async
    def create_chat_message(self, msg):
      thread_obj = self.thread_obj
      me = self.scope['user']
      return MessageDM.objects.create(thread=thread_obj, user=me, content=msg )
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from main.models import MessageDM, ConversationDM, Customer, Admin, User

class ChatConsumer(AsyncWebsocketConsumer):
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
