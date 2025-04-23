from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'direct-conversations', views.DirectConversationViewSet, basename='direct-conversation')
router.register(r'group-conversations', views.GroupConversationViewSet, basename='group-conversation')
router.register(r'support-tickets', views.SupportTicketViewSet, basename='support-ticket')

urlpatterns = [
    path('', include(router.urls)),
]