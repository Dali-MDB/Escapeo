from rest_framework import permissions

class IsParticipantOrAdmin(permissions.BasePermission):
    """Permission to check if user is a participant or admin"""
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # For direct conversations
        if hasattr(obj, 'customer'):
            return user == obj.customer or user == obj.admin
            
        # For group conversations
        if hasattr(obj, 'participants'):
            return obj.participants.filter(id=user.id).exists()
            
        # For messages, check the conversation
        if hasattr(obj, 'conversation'):
            conversation = obj.conversation
            if hasattr(conversation, 'directconversation'):
                direct = conversation.directconversation
                return user == direct.customer or user == direct.admin
            if hasattr(conversation, 'groupconversation'):
                group = conversation.groupconversation
                return group.participants.filter(id=user.id).exists()
        
        return False