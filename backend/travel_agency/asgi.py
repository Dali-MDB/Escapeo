"""
ASGI config for travel_agency project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""
"""
import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import get_default_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_agency.settings')
django.setup()
#application = get_asgi_application()
application = get_default_application()"""



"""
ASGI config for travel_agency project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

"""
ASGI config for travel_agency project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter 
from channels.auth import AuthMiddlewareStack
from .routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_agency.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)  
    ),
})