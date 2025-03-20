#<<<<<<< HEAD:travel_agency/main/permissions.py
#from rest_framework import permissions
#from .models import Admin


#class IsAdminOrReadOnly(permissions.DjangoModelPermissions):
#    def has_permission(self, request, view):
#
#        if request.method in permissions.SAFE_METHODS:
#            return True 
#        
#        return request.user.is_authenticated and Admin.objects.filter(user=request.user, department ='staff').exists()
#    
#    def has_object_permission(self, request, view, obj):
#        if request.method in permissions.SAFE_METHODS:
#            return True
#        
#        return request.user.is_authenticated and Admin.objects.filter(user=request.user, department ='staff').exists() and obj.created_by == request.user
#=======
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
    


class addAdminPermission(BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated
        if not request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to perform this action.")

        # Check if the user has the 'is_admin' attribute
        if not hasattr(request.user,'admin') :
            raise PermissionDenied("Only admin users are allowed to perform this action.")
        

        # Check if the user is an admin and belongs to the 'owner' department
        if request.user.admin.department != 'owner':
            raise PermissionDenied("Only admins in the 'owner' department are allowed to perform this action.")

        return True
#>>>>>>> a96ed28500fa535f1beee2238946d918d24d3f9c:backend/main/permissions.py
