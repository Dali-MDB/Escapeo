from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

from backend.chat.consumers import PrivateChatConsumer, GroupChatConsumer

application = ProtocolTypeRouter({
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                re_path(r"^ws/privatemessages/(?P<username>[a-zA-Z0-9_.0+-]+)/$", PrivateChatConsumer.as_asgi()),  
                re_path(r"^ws/groupmessages/(?P<group_id>[0-9a-f-]+)/$",GroupChatConsumer.as_asgi()),
            ])
        )
    ),
})
