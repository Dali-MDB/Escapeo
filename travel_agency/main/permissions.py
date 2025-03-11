from rest_framework import permissions
from .models import Admin


class IsAdminOrReadOnly(permissions.DjangoModelPermissions):
    def has_permission(self, request, view):

        if request.method in permissions.SAFE_METHODS:
            return True 
        
        return request.user.is_authenticated and Admin.objects.filter(user=request.user).exists()
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.is_authenticated and Admin.objects.filter(user=request.user).exists() and obj.created_by == request.user