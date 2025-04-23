from django.shortcuts import render
from django.core.files.storage import default_storage
from rest_framework.decorators import APIView,api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from main.serializers import UserSerializer
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import PasswordResetTokenGenerator
User = get_user_model()
#from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from .serializers import RequestPasswordResetCodeSerializer,ConfirmResetCodeSerializer

#---------------------Profiles-----------------------------------
class MyAccount(APIView):
    permission_classes = [IsAuthenticated]

            
    def get(self,request):
        ser = UserSerializer(request.user)
        return Response(ser.data)

   
    def put(self, request):
        ser = UserSerializer(data = request.data)
        if ser.is_valid():
            ser.save()  
            context = {
                'success': 'Your profile has been updated successfully',
                'profile': ser.data
            }
            return Response(context, status=status.HTTP_200_OK)
        else:
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)



import uuid
@api_view(['GET'])
def viewAccount(request,id):
    # UUID4 verification
    try:
        uuid.UUID(id, version=4)  # Will raise ValueError if invalid
    except ValueError:
        return Response(
            {"error": "Invalid ID format - must be UUID4"},
            status=status.HTTP_400_BAD_REQUEST
        )
    user = get_object_or_404(User,id=id)
    ser = UserSerializer(user)
    return Response(ser)





from .serializers import RequestPasswordResetCodeSerializer, ConfirmResetCodeSerializer

class RequestPasswordResetCodeView(APIView):
    def post(self, request):
        serializer = RequestPasswordResetCodeSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Reset code sent to your email."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConfirmPasswordResetCodeView(APIView):
    def post(self, request):
        serializer = ConfirmResetCodeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password has been reset."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile_picture(request):
    user = request.user
    new_profile_picture = request.FILES.get('profile_picture')
    
    if not new_profile_picture:
        return Response(
            {'error': 'No profile picture provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    #check if customer or admin
    profile = None
    if hasattr(user, 'customer'):
        profile = user.customer
        default_pic = 'profile.png' 
    elif hasattr(user, 'admin'):
        profile = user.admin
        default_pic = 'profile.png'  
    else:
        return Response(
            {'error': 'User profile not found'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if the user already has a profile picture that's not the default
    if profile.profile_picture and profile.profile_picture.name != default_pic:
        # Delete the old file from storage
        if default_storage.exists(profile.profile_picture.name):
            default_storage.delete(profile.profile_picture.name)
    

    profile.profile_picture = new_profile_picture
    profile.save()
    
    return Response(
        {
            'message': 'Profile picture updated successfully',
            'profile_picture_url': profile.profile_picture.url,
            'user_type': 'customer' if hasattr(user, 'customer') else 'admin'
        },
        status=status.HTTP_200_OK
    )


