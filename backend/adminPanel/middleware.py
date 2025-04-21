from .models import Visit
from django.utils.deprecation import MiddlewareMixin

class VisitorTrackingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # on ignore l'admin panel et le dossierqui contient static files
        if request.path.startswith('/adminPanel/') or request.path.startswith('/static/'):
            return

        ip = request.META.get('REMOTE_ADDR', '')
        path = request.path
        session_id = request.session.session_key or 'anonymous'

        Visit.objects.create(
            ip_address=ip,
            path=path,
            session_id=session_id,
            #  `country` et `duration_seconds` 
        )