from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied



class acceptHotelReservationPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to confirm a hotel reservation.")

        if not hasattr(request.user, 'admin'):
            raise PermissionDenied("Only admins can create confirm hotel reservations.")
        
        if request.user.admin.department in ['owner', 'hotel_manager']:
            return True
        
        raise PermissionDenied("Only owners or hotel managers can confirm hotel reservations.")
    


class acceptTripReservationPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            raise PermissionDenied("You must be logged in to confirm a trip reservation.")

        if not hasattr(request.user, 'admin'):
            raise PermissionDenied("Only admins can create confirm trip reservations.")
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if  obj.trip.created_by == request.user.admin or request.user.admin.department == 'owner':
            return True
       
        
        raise PermissionDenied("Only the trip owner or the superuser can confirm trip reservation")

        
        

