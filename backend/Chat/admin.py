from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(DirectConversation)
admin.site.register(GroupConversation)
admin.site.register(SupportTicket)
admin.site.register(Message)

