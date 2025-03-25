from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

from backend.chat.consumers import PrivateChatConsumer  # Ensure the correct import path

application = ProtocolTypeRouter({
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                re_path(r"^messages/(?P<recipient>[\w.@+-]+)/$", PrivateChatConsumer.as_asgi()),  
            ])
        )
    ),
})
