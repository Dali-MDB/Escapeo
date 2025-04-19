

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

        if request.user.admin.department in ['staff', 'owner']:
            return True

        raise PermissionDenied("You do not have permission to create a trip.")
    

class TripPermission(BasePermission):
    def has_permission(self, request, view):
        return True    #all users can access and view

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:   #can read 
            return True

        # Log write access attempts.
        if not request.user.is_authenticated:
            raise PermissionDenied("Only authenticated users can access")

        if not hasattr(request.user, 'admin'):
           raise PermissionDenied("Only admins are allowed to access")

        if  request.user.admin == obj.created_by or request.user.admin.department == 'owner':
            return True
        
        raise PermissionDenied("Only the trip owner or the superuser can edit this trip")

        
    


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
<<<<<<< HEAD
    
class DepartureTripPermission(BasePermission):
    def has_permission(self, request, view):
        return True  

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:  
            return True

        if not request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to modify this departure.")

        if not hasattr(request.user, 'admin'):
            raise PermissionDenied("Only admins can modify departures.")

        if request.user.admin == obj.trip.created_by or request.user.admin.department == 'owner':
            return True  

        raise PermissionDenied("Only the trip owner or the superuser can edit this trip")


class CustomerPermissions(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user,'customer')
=======
#>>>>>>> a96ed28500fa535f1beee2238946d918d24d3f9c:backend/main/permissions.py
>>>>>>> neil
