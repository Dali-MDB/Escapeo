import logging
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied

logger = logging.getLogger(__name__)


class CreateTripPermission(BasePermission):
    """
    Custom permission to allow only authenticated staff or owner users to create trips.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a trip.")

        if not hasattr(request.user, 'admin'):
            raise PermissionDenied("Only staff or owners can create trips.")

        if request.user.admin.department not in ['staff', 'owner']:
            raise PermissionDenied("You do not have permission to create a trip.")

        return True
    

class TripPermission(BasePermission):
    def has_permission(self, request, view):
        return True    #all users can access and view

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:   #can read 
            return True

        # Log write access attempts.
        if not request.user.is_authenticated:
            logger.warning(f"Unauthenticated user attempted to modify trip {obj.id}")
            return False

        if not hasattr(request.user, 'admin'):
            logger.warning(f"User {request.user.id} does not have the 'admin' attribute")
            return False

        if request.user.admin == obj.created_by or request.user.admin.role == 'owner':
            return True

        logger.warning(f"User {request.user.id} does not have permission to modify trip {obj.id}")
        return False 