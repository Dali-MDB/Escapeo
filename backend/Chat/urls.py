from django.urls import path
from .views import (
    DirectConversationListView,
    DirectMessageListView,
    CreateDirectConversationView,
    
    GroupConversationListView,
    GroupMessageListView,
    CreateGroupConversationView,

    SupportTicketListView,
    SupportTicketDetailView,
    AcceptTicketView,
    WebSocketInfoView
)

urlpatterns = [
    # ==================== Direct Messaging ====================
    path('direct-conversations/', #
         DirectConversationListView.as_view(), 
         name='direct-conversation-list'),
    path('direct-conversations/<int:conversation_id>/messages/', 
         DirectMessageListView.as_view(), 
         name='direct-message-list'),
    path('direct-conversations/create/<uuid:user_id>/', 
         CreateDirectConversationView.as_view(), 
         name='direct-conversation-create'),

    # ==================== Group Chat ====================
    path('group-conversations/', #
         GroupConversationListView.as_view(), 
         name='group-conversation-list'),
    path('group-conversations/<int:conversation_id>/messages/',# 
         GroupMessageListView.as_view(), 
         name='group-message-list'),
    path('group-conversations/create/<int:trip_id>/', #
         CreateGroupConversationView.as_view(), 
         name='group-conversation-create'),

    # ==================== Support Tickets ====================
    path('support-tickets/', 
         SupportTicketListView.as_view(), 
         name='support-ticket-list'),#
    path('support-tickets/<int:id>/', #
         SupportTicketDetailView.as_view(), 
         name='support-ticket-detail'),#
    path('support-tickets/<int:id>/accept/', 
         AcceptTicketView.as_view(), 
         name='support-ticket-accept'),#

    # ==================== WebSocket Info ====================
    path('ws-info/', 
         WebSocketInfoView.as_view(), 
         name='websocket-info'),
]