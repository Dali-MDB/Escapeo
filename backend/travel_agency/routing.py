from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

from chat.consumers import PrivateChatConsumer, GroupChatConsumer

websocket_urlpatterns = [
    re_path(r"^ws/chat/direct/(?P<conversation_id>[0-9a-f-]+)/$", PrivateChatConsumer.as_asgi()),
    re_path(r"^ws/chat/group/(?P<group_id>[0-9a-f-]+)/$", GroupChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})