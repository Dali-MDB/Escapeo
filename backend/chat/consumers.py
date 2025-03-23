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
    async def websocket_receive(self, event):
      print("receieve", event)

    async def websocket_disconnect(self, event):
       print("disconnected", event)  

@database_sync_to_async
def get_thread(self, user,other_username):
   return Thread.objects.get_or_new(user,other_username)[0]