"""
from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

from .consumers import PrivateChatConsumer, GroupChatConsumer

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
"""
"""
from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

from .consumers import PrivateChatConsumer, GroupChatConsumer

websocket_urlpatterns = [
    re_path(r"^ws/chat/direct/(?P<conversation_id>)/$", PrivateChatConsumer.as_asgi()),
    re_path(r"^ws/chat/group/(?P<group_id>)/$", GroupChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
"""
from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from travel_agency.middleware import JWTAuthMiddleware  
from .consumers import PrivateChatConsumer, GroupChatConsumer
"""
websocket_urlpatterns = [
    re_path(r"^ws/chat/direct/(?P<conversation_id>)/$", PrivateChatConsumer.as_asgi()),
    re_path(r"^ws/chat/group/(?P<group_id>)/$", GroupChatConsumer.as_asgi()),
]
"""
websocket_urlpatterns = [
   
    re_path(r'^ws/chat/direct/(?P<conversation_id>\d+)/$', PrivateChatConsumer.as_asgi()),
    re_path(r'^ws/chat/group/(?P<group_id>\d+)/$', GroupChatConsumer.as_asgi()),
]
application = ProtocolTypeRouter({
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware( 
            URLRouter(websocket_urlpatterns)
        )
    ),
})