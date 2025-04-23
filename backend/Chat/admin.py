from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Conversation, DirectConversation, GroupConversation, Message, SupportTicket

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'is_group', 'created_at', 'updated_at')
    
@admin.register(DirectConversation)
class DirectConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'admin', 'is_active', 'ticket')
    
@admin.register(GroupConversation)
class GroupConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'trip', 'participant_count')
    
    def participant_count(self, obj):
        return obj.participants.count()

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'conversation', 'timestamp', 'read')
    list_filter = ('read', 'timestamp')
    
@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'subject', 'status', 'admin')
    list_filter = ('status',)
    actions = ['close_tickets']
    
    def close_tickets(self, request, queryset):
        queryset.update(status='closed')