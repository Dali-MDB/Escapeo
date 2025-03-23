from django.db import models

from django.conf import settings
from django.db import models
from django.db.models import Q
from ..main.models import *
from .broadcastmsg import broadcast_msg_to_chat

class ThreadManager(models.Manager):
    def by_user(self, user):
        qlookup = Q(first=user) | Q(second=user)
        qlookup2 = Q(first=user) & Q(second=user)
        qs = self.get_queryset().filter(qlookup).exclude(qlookup2).distinct()
        return qs

    def get_or_new(self, user, other_username): # get_or_create
        username = user.username
        if username == other_username:
            return None
        qlookup1 = Q(first__username=username) & Q(second__username=other_username)
        qlookup2 = Q(first__username=other_username) & Q(second__username=username)
        qs = self.get_queryset().filter(qlookup1 | qlookup2).distinct()
        if qs.count() == 1:
            return qs.first(), False
        elif qs.count() > 1:
            return qs.order_by('timestamp').first(), False
        else:
            Klass = user.__class__
            user2 = Klass.objects.get(username=other_username)
            if user != user2:
                obj = self.model(
                        first=user, 
                        second=user2
                    )
                obj.save()
                return obj, True
            return None, False


class Thread(models.Model):
    customer        = models.ForeignKey('Customer', on_delete=models.CASCADE, related_name='chat_threads')
    staff           = models.ForeignKey('Admin', on_delete=models.CASCADE, related_name='chat_threads')
    updated         = models.DateTimeField(auto_now=True)
    timestamp       = models.DateTimeField(auto_now_add=True)
    
    objects      = ThreadManager()

    class Meta:
        constraints =[
            models.UniqueConstraint(fields=['customer','staff'],name='one_on_one_chat_with_admin')
        ]

    @property
    def room_group_name(self):
        return f'chat_{self.id}'

    def broadcast(self, msg=None):
        if msg is not None:
            broadcast_msg_to_chat(msg, group_name=self.room_group_name, user='admin')
            return True
        return False
    

# CONVERSATION MODELS
class ConversationDM(models.Model):
    staff = models.ForeignKey(Admin, on_delete=models.PROTECT)
    cust = models.ForeignKey(Customer, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # updated with each sent message
    last_message = models.ForeignKey('MessageDM', on_delete=models.SET_NULL, blank=True, null=True)

    class Meta:
        ordering = ['-updated_at']
        constraints = [
            models.UniqueConstraint(
                fields=['staff', 'cust'],
                name='conversation'
            ),
        ]

class MessageDM(models.Model):
    conversation = models.ForeignKey(ConversationDM, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.PROTECT,related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.PROTECT,related_name='received_messages')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['sent_at']

    def save(self,*args,**kwargs):
        if not (self.sender in [self.conversation.staff.user, self.conversation.cust.user] and 
                self.receiver in [self.conversation.staff.user, self.conversation.cust.user]):
            raise ValueError("Sender and receiver must be part of the conversation.")
        
        super().save(*args,**kwargs)
        self.conversation.last_message = self
        self.conversation.save()

class GroupChatConversation(models.Model):
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='group_chat')  # One group chat per trip
    participants = models.ManyToManyField(User, related_name='group_chats')  # Customers and admins in the chat
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Updated with each message

    class Meta:
        verbose_name = "Group Chat Conversation"
        verbose_name_plural = "Group Chat Conversations"
        ordering = ['-updated_at']

    def __str__(self):
        return f"Group Chat for {self.trip.title}"

class MessageGroup(models.Model):
    conversation = models.ForeignKey(GroupChatConversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_messages_sent')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Group Chat Message"
        verbose_name_plural = "Group Chat Messages"
        ordering = ['sent_at']

    def __str__(self):
        return f"Message by {self.sender.username} in {self.conversation.trip.title}"

class ChatbotConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatbot_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Updated with each message

    class Meta:
        verbose_name = "Chatbot Conversation"
        verbose_name_plural = "Chatbot Conversations"
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chatbot Conversation with {self.user.username}"