from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view,APIView,permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomerSerializer,TripSerializer,AdminSerializer
from django.contrib.auth import authenticate,get_user_model
from rest_framework.permissions import IsAuthenticated

from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Trip
from .permissions import TripPermission,CreateTripPermission,addAdminPermission


User = get_user_model()



@api_view(['GET'])
def home(request):
    return Response({"hello world" : "hello world"},status=status.HTTP_202_ACCEPTED)



@api_view(['POST'])
def register(request):
    user_ser = CustomerSerializer(data=request.data)
    if user_ser.is_valid():
        customer = user_ser.save()
        refresh = RefreshToken.for_user(customer.user)

        context = {
            'details' : user_ser.data,
            'success' : 'user created successfully',
            'refresh' : str(refresh),
            'access' :  str(refresh.access_token)
        }
        return  Response(context, status=status.HTTP_201_CREATED)
    return Response(user_ser.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
def login(request):
    username_or_email = request.data.get('email')
    password = request.data.get('password')

    if not username_or_email or not password:
        return Response({"error": "Email/Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(email=username_or_email, password=password)

    if not user:
        # Try authenticating by email
        try:
            email = User.objects.get(username=username_or_email).email
            user = authenticate(email=email, password=password)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
    if user:
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh' : str(refresh),
            'access' : str(refresh.access_token)
        }
        return Response(tokens, status=status.HTTP_200_OK)

    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"success":"you are allowed to view this page"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data['refresh']
    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()  # Blacklist the refresh token
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
    except :
        return Response({'error': 'something happened'}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['post'])
def get_refresh(request):
    try:
        access = str(  RefreshToken(request.data['refresh']).access_token  )
        return Response({'access':access})
    except:
        return Response({'error':'the given token has been blacklisted'})





@api_view(['POST'])
@permission_classes([addAdminPermission])
def addAdmin(request):
    admin_ser = AdminSerializer(data=request.data)
    if admin_ser.is_valid():
        
        admin = admin_ser.save()
        admin.user.is_admin = True
        admin.user.save()

        context = {
            'success' : 'a new admin has been added successfully',
            'details' : admin_ser.data
        }
        return  Response(context, status=status.HTTP_201_CREATED)
    return Response(admin_ser.errors, status=status.HTTP_400_BAD_REQUEST)


#----------------------- Trips -------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated,CreateTripPermission])
def addTrip(request):
    validated_data = request.data
    validated_data['created_by'] = request.user.admin.id
    trip_ser = TripSerializer(data=validated_data)
    if trip_ser.is_valid():
        trip_ser.save()
        return Response({'success : a new trip has been added successfully'},status=status.HTTP_201_CREATED)
    return Response(trip_ser.errors,status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def allTrips(request):

    all_trips = Trip.objects.all()
    trips_ser = TripSerializer(all_trips,many=True)
    return Response(trips_ser.data)


#@api_view(['GET','PUT','DELETE'])

class tripDetails(APIView):
    permission_classes = [TripPermission]
    def get_trip(self,pk):
        return get_object_or_404(Trip,id=pk)
    
    def get(self,request,pk):
        trip = self.get_trip(pk)
        trip_ser = TripSerializer(trip)
        return Response(trip_ser.data,status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        trip = self.get_trip(pk)
        

        trip_ser = TripSerializer(trip, data=request.data,partial = True)  
        if trip_ser.is_valid():
            trip_ser.save()
            return Response(trip_ser.data, status=status.HTTP_200_OK)
        
        return Response(trip_ser.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, pk):
        trip = self.get_trip(pk)

        trip.delete()
        return Response({'success': 'Deletion was successful'}, status=status.HTTP_204_NO_CONTENT)

        
    
    
#---------------------Profiles-----------------------------------
class MyProfile(APIView):
    permission_classes = [IsAuthenticated]

    def get_my_account(self,user):
        if hasattr(user,'admin'):
            profile = user.admin
            profile_ser = AdminSerializer(profile)
        else:  #hasattr(user,'customer')
            profile = user.customer
            profile_ser = CustomerSerializer(profile)

        profile_data = profile_ser.data
        profile_data.pop('user')
        return profile_data
            
    def get(self,request):
        profile_data =  self.get_my_account(request.user)
        profile_data['username'] = request.user.username
        return Response(profile_data)

   
    def put(self, request):
        profile_data = request.data
        profile_data.pop('user',None)
        
        if hasattr(request.user, 'admin'):
            profile_ser = AdminSerializer(request.user.admin, data=profile_data, partial=True)
        else:
            profile_ser = CustomerSerializer(request.user.customer, data=profile_data, partial=True)


        if profile_ser.is_valid():
            profile_ser.save()  

        
            response_data = profile_ser.data
            response_data.pop('user', None)   #hide user from data

            context = {
                'success': 'Your profile has been updated successfully',
                'profile': response_data
            }
            return Response(context, status=status.HTTP_200_OK)
        else:
            return Response(profile_ser.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def viewProfile(request,id):
    user = get_object_or_404(User,id=id)
    if hasattr(user,'admin'):
        profile = user.admin
        profile_ser = AdminSerializer(profile)
    else:  #hasattr(user,'customer')
        profile = user.customer
        profile_ser = CustomerSerializer(profile)

    profile_data = profile_ser.data
    profile_data.pop('user')
    profile_data['username'] = request.user.username
    return Response(profile_data)













