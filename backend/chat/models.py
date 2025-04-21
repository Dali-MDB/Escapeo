from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from main.models import Trip

User = get_user_model()

class Conversation(models.Model):
    """Base conversation model that can be either direct or group"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_group = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        if self.is_group:
            return f"Group Conversation {self.id}"
        return f"Direct Conversation {self.id}"

class DirectConversation(Conversation):
    """One-to-one conversation between customer and admin"""
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_conversations')
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_conversations', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    ticket = models.OneToOneField('SupportTicket', on_delete=models.SET_NULL, null=True, blank=True)
    
    def save(self, *args, **kwargs):
        self.is_group = False
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Direct: {self.customer} - {self.admin or 'Unassigned'}"

class GroupConversation(Conversation):
    """Group conversation related to a trip"""
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='group_conversation')
    participants = models.ManyToManyField(User,related_name='my_chats')
    
    def save(self, *args, **kwargs):
        self.is_group = True
        super().save(*args, **kwargs)

    def join(self,joiner):
        if self.participants.filter(id=joiner.id).exists():
            return False 
        self.participants.add(joiner)
        return True  
        
    def __str__(self):
        return f"Group: {self.name} (Trip: {self.trip})"
    




class Message(models.Model):
   
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender} at {self.timestamp}: {self.content[:50]}"


class SupportTicket(models.Model):
   
    TICKET_STATUS = (
        ('open', 'Open'),
        ('claimed', 'Claimed by Admin'),
        ('closed', 'Closed'),
    )
    
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    subject = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=TICKET_STATUS, default='open')
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    
    def __str__(self):
        return f"Ticket #{self.id}: {self.subject} ({self.status})"
    
    def claim(self, admin):
    
        if self.status == 'open':
            self.admin = admin  # admin should be a User instance
            self.status = 'claimed'
            self.save()

        # Create a conversation if it doesn't exist
            conversation, created = DirectConversation.objects.get_or_create(
                ticket=self,
                defaults={
                    'customer': self.customer,
                    'admin': admin,
                    'is_active': True
                }
            )
            if not created:
                conversation.admin = admin
                conversation.is_active = True
                conversation.save()

            return True  # Claiming was successful

        return False  # Already claimed or closed

    
    def close(self):
        """Close the ticket and related conversation"""
        self.status = 'closed'
        self.save()
        # Mark conversation as inactive
        DirectConversation.objects.filter(ticket=self).update(is_active=False)