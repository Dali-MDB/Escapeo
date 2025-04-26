# backend/travel_agency/middleware.py
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