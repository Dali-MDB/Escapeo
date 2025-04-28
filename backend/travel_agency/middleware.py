"""
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope["headers"])
        if b'authorization' in headers:
            try:
                token_name, token = headers[b'authorization'].decode().split()
                if token_name.lower() == 'bearer':
                    scope["user"] = await self.get_user(token)
            except:
                scope["user"] = AnonymousUser()
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            access_token = AccessToken(token)
            return User.objects.get(id=access_token['user_id'])
        except:
            return AnonymousUser()
"""

from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken, TokenError
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
import logging

logger = logging.getLogger(__name__)

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:
            token = self._get_token_from_headers(scope)

            if not token:
                token = self._get_token_from_query(scope)

            scope["user"] = await self.get_authenticated_user(token)

        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    def _get_token_from_headers(self, scope):
        headers = dict(scope["headers"])
        auth_header = headers.get(b'authorization', b'').decode()
        if auth_header.lower().startswith('bearer '):
            return auth_header[7:].strip()
        return None

    def _get_token_from_query(self, scope):
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token_list = params.get('token')
        if token_list:
            return token_list[0].strip()
        return None

    @database_sync_to_async
    def get_authenticated_user(self, token):
        if not token:
            return AnonymousUser()

        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            access_token = AccessToken(token)
            return User.objects.get(id=access_token['user_id'])
        except (TokenError, User.DoesNotExist) as e:
            logger.warning(f"Authentication failed: {str(e)}")
            return AnonymousUser()
        except Exception as e:
            logger.error(f"Unexpected auth error: {str(e)}")
            return AnonymousUser()