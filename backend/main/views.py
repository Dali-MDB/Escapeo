from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view,APIView,permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomerSerializer,TripSerializer,AdminSerializer
from django.contrib.auth import authenticate,get_user_model
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Trip
from .permissions import TripPermission,CreateTripPermission,addAdminPermission,CustomerPermissions


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



#------------- filtering system -----------------------------
@api_view(['GET'])
def TripsFiltering(request):
    # Extract filtering parameters
    departure_city = request.GET.get('departure_city')
    destination = request.GET.get('destination')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    min_discount = request.GET.get('min_discount')
    max_discount = request.GET.get('max_discount')
    departure_date = request.GET.get('departure_date')
    is_one_way = request.GET.get('is_one_way')
    trip_types = request.GET.getlist('trip_type')
    experiences = request.GET.getlist('experience')
    destination_types = request.GET.getlist('destination_type')
    transports = request.GET.getlist('transport')
    min_stars = request.GET.get('min_stars')
    max_stars = request.GET.get('max_stars')
    sort = request.GET.get('sort')
    ascending = request.GET.get('ascending')

    # Start with an empty Q object
    query = Q()

    if departure_city:
        query &= Q(departure_city__icontains=departure_city)
    if destination:
        query &= Q(country__icontains=destination) | Q(city__icontains=destination)
    if min_price:
        query &= Q(price__gte=min_price)
    if max_price:
        query &= Q(price__lte=max_price)
    if min_discount:
        query &= Q(discount__gte=min_discount)
    if max_discount:
        query &= Q(discount__lte=max_discount)
    if min_stars:
        query &= Q(stars_rating__gte=min_stars)
    if max_stars:
        query &= Q(stars_rating__lte=max_stars)
    if departure_date:
        query &= Q(departure_date__gte=departure_date)
    if is_one_way is not None:
        query &= Q(is_one_way=is_one_way.lower() == "true")
    if trip_types:
        query &= Q(trip_type__in=trip_types)
    if experiences:
        query &= Q(experience__in=experiences)
    if destination_types:
        query &= Q(destination_type__in=destination_types)
    if transports:
        query &= Q(transport__in=transports)

    # Fetch filtered trips
    trips = Trip.objects.filter(query)

    # Apply sorting logic
    valid_sort_fields = ["price", "departure_date", "stars_rating", "discount"]

    if sort == "recommended":
        now = timezone.now()
        for trip in trips:
            # Calculate total price after discount
            total_price = float(trip.price) * (1 - float(trip.discount or 0) / 100)

            # Normalize scores
            max_stars = 5  # Maximum possible stars
            max_price = max(float(t.price) for t in trips) if trips else 1  # Avoid division by zero
            max_capacity = max(t.capacity for t in trips) if trips else 1

            # Weighted scoring
            stars_weight = 0.4  # Higher stars = better
            price_weight = 0.3  # Lower price = better
            availability_weight = 0.2  # More availability = better
            urgency_weight = 0.1  # Closer departure date = better

            # Star rating score (normalized to 0-1)
            stars_score = (trip.stars_rating or 0) / max_stars

            # Price score (normalized to 0-1, lower price = better)
            price_score = 1 - (total_price / max_price)

            # Availability score (normalized to 0-1, more availability = better)
            availability_score = (trip.capacity - trip.sold_tickets) / max_capacity

            # Urgency score (normalized to 0-1, closer departure date = better)
            days_until_departure = (trip.departure_date - now).days
            urgency_score = 1 / (days_until_departure + 1) if days_until_departure >= 0 else 0

            # Final recommendation score (weighted sum)
            trip.rec_score = (
                stars_weight * stars_score +
                price_weight * price_score +
                availability_weight * availability_score +
                urgency_weight * urgency_score
            )



        # Sort by recommendation score
        ascending = True if ascending and ascending.lower() == 'true' else False
        sorted_trips = sorted(trips, key=lambda x: x.rec_score, reverse=not ascending)
    else:
        if sort in valid_sort_fields:
            if ascending and ascending.lower() == "false":
                sort = f"-{sort}"  # Descending order
            sorted_trips = trips.order_by(sort)
        else:
            sorted_trips = trips  # Default order if sorting is invalid

    # Serialize results
    serializer = TripSerializer(sorted_trips, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



#------------------- recommmendations ------------------
from .recommendations import get_recommendations
@api_view(['GET'])
@permission_classes([IsAuthenticated, CustomerPermissions])
def recommendedTrips(request):
    customer = request.user.customer
    total_trips = customer.purchased_trips.count() + customer.favorite_trips.count()

    # Determine alpha dynamically
    if total_trips == 0:
        alpha = 0
    elif total_trips < 5:
        alpha = 0.1
    elif total_trips < 10:
        alpha = 0.2
    elif total_trips < 30:
        alpha = 0.4
    else:
        alpha = 0.6

    # Sorting parameters
    valid_sort_fields = ["price", "departure_date", "stars_rating", "discount"]
    sort_field = request.GET.get("sort")
    ascending = request.GET.get("ascending", "true").lower() == "true"

    if alpha == 0:
        # Recommend exactly 10 trips from Algeria, sorted by stars_rating (highest first)
        recommendations = Trip.objects.filter(country="Algeria").order_by("-stars_rating")[:10]
    else:
        # Get personalized recommendations
        num_recommendations = int(alpha * 100)
        recommendations = get_recommendations(customer.id, num_recommendations, alpha)

    # Apply sorting if a valid sort field is provided
    if sort_field in valid_sort_fields:
        order_by_field = sort_field if ascending else f"-{sort_field}"
        recommendations = recommendations.order_by(order_by_field)

    # Serialize and return recommendations
    recommended_trips = TripSerializer(recommendations, many=True)
    return Response({'recommendations': recommended_trips.data})




@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def path_not_found(request, path=None):
    return Response(
        {"error": "The page you are looking for does not exist", "path": request.path}, 
        status=status.HTTP_404_NOT_FOUND
    )










