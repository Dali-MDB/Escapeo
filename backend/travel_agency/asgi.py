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
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter 
from channels.auth import AuthMiddlewareStack
from backend.chat.routing import websocket_urlpatterns

import sys
import os


import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.travel_agency.settings')
application = get_asgi_application()

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_agency.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)  
    ),
})
"""
"""
import os
import sys
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from backend.chat.routing import websocket_urlpatterns


import sys
from pathlib import Path

# Add project root to Python path
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Adjust based on actual structure
sys.path.append(str(BASE_DIR))

# Add the backend directory to the Python path (if necessary)
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# Set the DJANGO_SETTINGS_MODULE environment variable
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.travel_agency.settings')

# Get the ASGI application
django_asgi_app = get_asgi_application()

# Define the ASGI application with routing for both HTTP and WebSocket
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
"""
"""
import os
import sys
from pathlib import Path
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Calculate the correct base directory (3 levels up from asgi.py)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.travel_agency.settings')

# Initialize Django ASGI application
django_asgi_app = get_asgi_application()

# Import websocket patterns after Django is initialized
from backend.chat.routing import websocket_urlpatterns

# Combine HTTP and WebSocket routing
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
"""
"""
import os
import sys
from pathlib import Path
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Set the correct base directory (assuming this file is in backend/)
BASE_DIR = Path(__file__).resolve().parent

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_agency.settings')

# Initialize Django ASGI application
django_asgi_app = get_asgi_application()

# Import websocket patterns after Django is initialized
from chat.routing import websocket_urlpatterns

# Combine HTTP and WebSocket routing
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
"""
"""
import os
import sys
from pathlib import Path
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Set the correct base directory (adjust based on actual structure)
BASE_DIR = Path(__file__).resolve().parent.parent  # This should be adjusted based on your project structure

# Add the project root to the Python path if necessary
sys.path.append(str(BASE_DIR))

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_agency.settings')

# Initialize Django ASGI application
django_asgi_app = get_asgi_application()

# Import websocket patterns after Django is initialized
from backend.chat.routing import websocket_urlpatterns  # Adjust the import based on your app's structure

# Define the ASGI application with routing for both HTTP and WebSocket
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
"""
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent 
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_agency.settings')  


from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()


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
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent 
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_agency.settings')  

from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter

try:
    from chat.routing import websocket_urlpatterns
    from travel_agency.middleware import JWTAuthMiddleware
except ImportError as e:
    raise ImportError(f"Couldn't import required modules: {e}")

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    )
})
