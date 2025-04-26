"""
ASGI config for travel_agency project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_agency.settings')

application = get_asgi_application()


import os
import sys
from pathlib import Path

# Set paths FIRST (before any Django imports)
BASE_DIR = Path(__file__).resolve().parent.parent # Escapeo/
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_agency.settings')  # Not 'backend.travel_agency.settings'

# Now import Django components
from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

# Then import other dependencies
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

try:
    from chat.routing import websocket_urlpatterns
    from travel_agency.middleware import JWTAuthMiddleware
except ImportError as e:
    raise ImportError(f"Couldn't import required modules: {e}")

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    )
})