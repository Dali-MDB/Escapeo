from django.urls import path
from .views import (
    ListMessages, ListConversation, ListGroupConversations, ListGroupMessages,
    SupportTicketView, AcceptTicketView,
    CreateGroupChatAPIView, CreatePrivateChatAPIView
)

urlpatterns = [
    path('messages/<int:conversation_id>/', ListMessages.as_view(), name='list-messages'),
    path('conversations/', ListConversation.as_view(), name='list-conversations'),
    path('group-messages/<int:conversation_id>/', ListGroupMessages.as_view(), name='list-group-messages'),
    path('group-conversations/', ListGroupConversations.as_view(), name='list-group-conversations'),
    path('support/tickets/', SupportTicketView.as_view(), name='support-tickets'),
    path('support/tickets/<int:pk>/accept/', AcceptTicketView.as_view(), name='accept-ticket'),
    path('create-group-chat/<int:trip_id>/', CreateGroupChatAPIView.as_view(), name='create-group-chat'),
    path('create-private-chat/<int:user_id>/', CreatePrivateChatAPIView.as_view(), name='create-private-chat'),
]
