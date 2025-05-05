from main.serializers import UserSerializer
from django.shortcuts import render
from django.core.files.storage import default_storage
from rest_framework.decorators import APIView,api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
User = get_user_model()
#from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from .serializers import RequestPasswordResetCodeSerializer,ConfirmResetCodeSerializer
from django.contrib.auth.hashers import check_password

#---------------------Profiles-----------------------------------
class MyAccount(APIView):
    permission_classes = [IsAuthenticated]

            
    def get(self,request):
        ser = UserSerializer(request.user)
        return Response(ser.data)

   
    def put(self, request):
        user = request.user
        data = request.data
        
        # Track updates and errors
        updates = {}
        errors = {}
        # Password confirmation
        password = data.get('password', None)
        if not password:
            return Response(
                {'error': 'Password confirmation required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not check_password(password, user.password):
            return Response(
                {'error': 'Incorrect password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Email update
        if 'email' in data:
            email = str(data['email']).strip()
            if email and User.objects.filter(email=email).exclude(pk=user.pk).exists():
                errors['email'] = "Email already taken"
            else:
                updates['email'] = email if email else None

        # Username update
        if 'username' in data:
            username = str(data['username']).strip()
            if username and User.objects.filter(username=username).exclude(pk=user.pk).exists():
                errors['username'] = "Username taken"
            else:
                updates['username'] = username if username else None

        # Phone number update
        if 'phone_number' in data:
            phone = str(data['phone_number']).strip()
            
            if phone and User.objects.filter(phone_number=phone).exclude(pk=user.pk).exists():
                errors['phone_number'] = "Phone number in use"
            else:
                updates['phone_number'] = phone if phone else None

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Apply updates
        for field, value in updates.items():
            setattr(user, field, value)

        
        user.save()
        return Response({
            'success': True,
            'user': {
                'username': user.username,
                'email': user.email,
                'phone_number': user.phone_number
            }
        })
        
    



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


from main.models import Trip
from main.permissions import CustomerPermissions
from rest_framework.exceptions import ValidationError
from main.serializers import TripSerializer
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_managed_trips(request):
    if not hasattr(request.user,'admin'):
        raise ValidationError("Only admins are allowed to view this page")
    if request.user.admin.department == 'owner':
        trips = Trip.objects.all()
    elif request.user.admin.department == 'staff':
        trips = Trip.objects.filter(created_by = request.user.admin)
    else:
        raise ValidationError("Only admins with roles owner or staff are allowed to view this page ")
    
    coming = trips.filter(status = 'coming')
    ongoing = trips.filter(status = 'ongoing')
    done = trips.filter(status = 'done')
    
    return Response({
        'coming_trips' : TripSerializer(coming,many=True).data,
        'ongoing_trips' : TripSerializer(ongoing,many=True).data,
        'done_trips' : TripSerializer(done,many=True).data
    },status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([IsAuthenticated,CustomerPermissions])
def get_my_travel_history(request):
    trips = request.user.customer.purchased_trips.all()
    coming = trips.filter(status = 'coming')
    ongoing = trips.filter(status = 'ongoing')
    done = trips.filter(status = 'done')
    return Response({
        'coming_trips' : TripSerializer(coming,many=True).data,
        'ongoing_trips' : TripSerializer(ongoing,many=True).data,
        'done_trips' : TripSerializer(done,many=True).data
    },status=status.HTTP_200_OK)




    
        
    