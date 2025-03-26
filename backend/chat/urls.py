from django.urls import path
from .views import ListMessages, ListConversation, ListGroupConversations, ListGroupMessages

urlpatterns = [
    path('messages/<int:conversation_id>/', ListMessages.as_view(), name='list-messages'),
    path('conversations/', ListConversation.as_view(), name='list-conversations'),
    path('group-messages/<int:conversation_id>/', ListGroupMessages.as_view(), name='list-group-messages'),
    path('group-conversations/', ListGroupConversations.as_view(), name='list-group-conversations'),
]