from django.urls import path
from .views import ListMessages, ListConversation

urlpatterns = [
    path('messages/<int:conversation_id>/', ListMessages.as_view(), name='list-messages'),
    path('conversations/', ListConversation.as_view(), name='list-conversations'),
]