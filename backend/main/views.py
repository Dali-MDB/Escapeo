from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view,APIView,permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomerSerializer,TripSerializer,AdminSerializer,DepartureTripSerializer,HotelSerializer
from django.contrib.auth import authenticate,get_user_model
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from django.db.models import Q, F, Min, Max, Subquery, OuterRef, ExpressionWrapper, FloatField, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Trip,TripImage,DepartureTrip,Hotel,HotelImages,Notification,Admin,Customer
from .permissions import TripPermission,CreateTripPermission,addAdminPermission,CustomerPermissions,DepartureTripPermission,CreateHotelPermission,HotelPermission
from decimal import Decimal




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

        Notification.objects.create(
            recipient=customer.user,
            type='Security',
            title='Welcome to Our Travel Platform!',
            message='Your account has been successfully created. We are excited to have you onboard!',
        )
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


        Notification.objects.create(
            recipient=admin.user,  # assuming new_admin is the Admin instance just created
            type='Security',
            title='Admin Account Created',
            message='Your admin account has been created by the system administrator. You can now log in and manage the platform.',
        )

        context = {
            'success' : 'a new admin has been added successfully',
            'details' : admin_ser.data
        }
        return  Response(context, status=status.HTTP_201_CREATED)
    return Response(admin_ser.errors, status=status.HTTP_400_BAD_REQUEST)



#------------------------------hotels----------------------------------------------

# ---------------------- Hotels ------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated, CreateHotelPermission])
def addHotel(request):
    hotel_ser = HotelSerializer(data=request.data)
    if hotel_ser.is_valid():
        hotel = hotel_ser.save()

        notified_admins = Admin.objects.filter(department__in=['owner', 'hotel_manager'])

        # Create notifications for each admin (either owner or hotel_manager)
        for admin in notified_admins:
            Notification.objects.create(
                recipient=admin.user,
                type='Hotel',
                title='New Hotel Added',
                message=f'A new hotel named "{hotel.name}" has been added by {request.user.admin}.',
            )

        return Response({
            'success': 'A new hotel has been added successfully',
            'hotel' : hotel_ser.data,
            }, status=status.HTTP_201_CREATED)
    return Response(hotel_ser.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def allHotels(request):
    hotels = Hotel.objects.all()
    serializer = HotelSerializer(hotels, many=True)
    return Response(serializer.data)


class HotelDetails(APIView):
    permission_classes = [HotelPermission]

    def get(self, request, pk):
        hotel = get_object_or_404(Hotel, id=pk)
        return Response(HotelSerializer(hotel).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        hotel = get_object_or_404(Hotel, id=pk)
        self.check_object_permissions(request, hotel)  # Check permissions
        
        # Get all old data dynamically
        old_data = {
            field.name: getattr(hotel, field.name)
            for field in hotel._meta.get_fields()
            if not field.is_relation or field.one_to_one or (field.many_to_one and field.related_model)
        }


        hotel_ser = HotelSerializer(hotel, data=request.data, partial=True)
        if hotel_ser.is_valid():
            hotel_ser.save()

            notified_admins = Admin.objects.filter(department__in=['owner', 'hotel_manager'])

            #Compare changes
            new_data = hotel_ser.data
            changes = []

            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if str(old_value) != str(new_value):
                    print(old_value,'xxxxxxxx',new_value)
                    changes.append(f'{field.replace("_", " ").title()}: "{old_value}" → "{new_value}"')

            if changes:
                changes = "\n".join(changes)

                # Create notifications for each admin
                for admin in notified_admins:
                    Notification.objects.create(
                        recipient=admin.user,  # The admin to receive the notification
                        type='Hotel',  # Notification type
                        title='Hotel Updated',  # Title of the notification
                        message=f'The hotel "{hotel.name}" has been updated by {request.user.admin}.\nChanges:\n{changes}',
                    )

            return Response(hotel_ser.data, status=status.HTTP_200_OK)
        return Response(hotel_ser.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        hotel = get_object_or_404(Hotel, id=pk)
        self.check_object_permissions(request, hotel)  # Check permissions
        hotel.delete()
        return Response({'success': 'Deletion was successful'}, status=status.HTTP_204_NO_CONTENT)




@api_view(['POST'])
@permission_classes([HotelPermission])
def addHotelImages(request, id):
    hotel = get_object_or_404(Hotel, id=id)
    permission = HotelPermission()
    permission.has_object_permission(request, None, hotel)

    if 'uploaded_images' not in request.FILES:
        return Response({'details': 'No image files provided'}, status=status.HTTP_400_BAD_REQUEST)

    images = request.FILES.getlist('uploaded_images')  # Get multiple files

    for image in images:
        HotelImages.objects.create(hotel=hotel, image=image)

    return Response({'success': 'You have added images successfully'}, status=status.HTTP_201_CREATED)


import json
@api_view(['POST'])
@permission_classes([HotelPermission])
def deleteHotelImages(request, id):
    hotel = get_object_or_404(Hotel, id=id)
    permission = HotelPermission()
    permission.has_object_permission(request, None, hotel)
    
    image_ids = request.data.get('deleted_images', [])

    if not image_ids:
        return Response({'success': 'No images selected for deletion'}, status=status.HTTP_200_OK)

    # Handle form-data (string input) & JSON (list input)
    if isinstance(image_ids, str):  
        try:
            image_ids = json.loads(image_ids)  # Convert string to list
        except json.JSONDecodeError:
            return Response({'error': 'Invalid image ID format'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        image_ids = [int(image_id) for image_id in image_ids]  # Ensure IDs are integers
    except ValueError:
        return Response({'error': 'Invalid image ID format'}, status=status.HTTP_400_BAD_REQUEST)

    images_to_delete = HotelImages.objects.filter(id__in=image_ids, hotel=hotel)

    for image in images_to_delete:
        if image.image:
            image.image.delete(save=False)  # Deletes the image file from storage

    deleted_count, _ = images_to_delete.delete()

    return Response({'success': f'{deleted_count} images deleted successfully'}, status=status.HTTP_200_OK)






@api_view(['GET'])
def search_hotels(request):
    location = request.GET.get('location', '')
    min_stars = request.GET.get('min_stars')
    max_stars = request.GET.get('max_stars')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    sort = request.GET.get('sort')  # 'price' or 'stars'
    ascending = request.GET.get('ascending', 'true').lower() == 'true'

    filters = Q()

    if location:
        filters &= Q(location__icontains=location)

    if min_stars:
        filters &= Q(stars_rating__gte=int(min_stars))
    if max_stars:
        filters &= Q(stars_rating__lte=int(max_stars))
    
    if min_price:
        filters &= Q(price_per_night__gte=Decimal(min_price)) 
    if max_price:
        filters &= Q(price_per_night__lte=Decimal(max_price))  

    hotels = Hotel.objects.filter(filters)
    # Sorting
    if sort == 'recommended':
        hotels = list(hotels)
        # Normalize values and calculate recommendation score
        max_price = max((h.price_per_night for h in hotels), default=1)
        max_stars = 5  # Since stars are always between 1–5

        for hotel in hotels:
            price_score = float(hotel.price_per_night) / float(max_price)
            star_score = hotel.stars_rating / max_stars
            hotel.recommendation_score = 0.7 * (1 - price_score) + 0.3 * star_score  # Lower price is better

        hotels.sort(key=lambda h: h.recommendation_score, reverse=not ascending)

    if sort in ['price', 'stars_rating']:
        sort_field = 'price_per_night' if sort == 'price' else 'stars_rating'
        if not ascending:
            sort_field = f'-{sort_field}'
        hotels = hotels.order_by(sort_field)

    serializer = HotelSerializer(hotels, many=True)
    return Response(serializer.data)


#----------------------- Trips -------------------------------
@api_view(['POST'])
@permission_classes([CreateTripPermission])
def addTrip(request):
    validated_data = request.data
    validated_data['created_by'] = request.user.admin.id
    trip_ser = TripSerializer(data=validated_data)
    if trip_ser.is_valid():
        trip = trip_ser.save()

        notified_admins = Admin.objects.filter(department='owner')
        if request.user.admin.department != 'owner':
            notified_admins = list(notified_admins) + [request.user.admin]

        # Create notifications for each admin (either owner or hotel_manager)
        for admin in notified_admins:
            Notification.objects.create(
                recipient=admin.user,
                type='Trip',
                title='New Trip Added',
                message=f'A new Trip named "{trip.title}" has been added by {request.user.admin}.',
            )
        return Response({
"success" : "a new trip has been added successfully",
"trip_id" : trip.id
},status=status.HTTP_201_CREATED)


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
        


        old_data = {
            field.name: getattr(trip, field.name)
            for field in trip._meta.get_fields()
            if not field.is_relation  # Exclude related fields
        }
        trip_ser = TripSerializer(trip, data=request.data, partial=True)
        if trip_ser.is_valid():
            trip_ser.save()


            notified_admins = Admin.objects.filter(department='owner')
            if request.user.admin.department != 'owner':
                notified_admins = list(notified_admins) + [request.user.admin]

            #Compare changes
            new_data = trip_ser.data
            changes = []

            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if str(old_value) != str(new_value):
                    changes.append(f'{field.replace("_", " ").title()}: "{old_value}" → "{new_value}"')

            if changes:
                changes = "\n".join(changes)

                # Create notifications for each admin
                for admin in notified_admins:
                    Notification.objects.create(
                        recipient=admin.user,  # The admin to receive the notification
                        type='Trip',  # Notification type
                        title='Trip Updated',  # Title of the notification
                        message=f'The Trip "{trip.title}" has been updated by {request.user.admin}.\nChanges:\n{changes}',
                    )
            return Response(trip_ser.data, status=status.HTTP_200_OK)
        
        return Response(trip_ser.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, pk):
        trip = self.get_trip(pk)
        self.check_object_permissions(request, trip)  

        trip.delete()
        return Response({'success': 'Deletion was successful'}, status=status.HTTP_204_NO_CONTENT)

        
   


@api_view(['POST'])
@permission_classes([TripPermission])
def associate_hotel_to_trip(request,trip_id):
    permission = TripPermission()
    trip = get_object_or_404(Trip,id=trip_id)
    permission.has_object_permission(request,None,trip)
    hotel = get_object_or_404(Hotel,id=request.data.get('hotel_id'))
    trip.hotel = hotel
    trip.save()
    return Response({'success':'the hotel has been associated successfully to this trip'},status=status.HTTP_202_ACCEPTED)




@api_view(['POST'])
@permission_classes([TripPermission])
def addTripImages(request, id):
    trip = get_object_or_404(Trip, id=id)
    permission = TripPermission()
    permission.has_object_permission(request,None,trip)
    
    if 'uploaded_images' not in request.FILES:
        return Response({'details': 'No image files provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    images = request.FILES.getlist('uploaded_images')  # Get multiple files
    
    for image in images:
        TripImage.objects.create(trip=trip, image=image)

    return Response({'success':'you have added images successfully'},status=status.HTTP_204_NO_CONTENT) 



@api_view(['POST'])
@permission_classes([TripPermission])
def deleteTripImages(request, id):
    trip = get_object_or_404(Trip, id=id)
    permission = TripPermission()
    permission.has_object_permission(request,None,trip)
    image_ids = request.data.get('deleted_images', [])

    # If the user unselected all images and hit save, just return success without deleting anything.
    if not image_ids:
        return Response({'success': 'No images selected for deletion'}, status=status.HTTP_200_OK)

    if isinstance(image_ids, str):  
        try:
            image_ids = json.loads(image_ids)  # Convert string to list
        except json.JSONDecodeError:
            return Response({'error': 'Invalid image ID format'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        image_ids = [int(image_id) for image_id in image_ids]  # Ensure IDs are integers
    except ValueError:
        return Response({'error': 'Invalid image ID format'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Find images related to the trip and the provided IDs
    images_to_delete = TripImage.objects.filter(id__in=image_ids, trip=trip)

    # Delete images from media storage
    for image in images_to_delete:
        if image.image:
            image.image.delete(save=False)  # Deletes the image file from storage

    # Now delete from the database
    deleted_count, _ = images_to_delete.delete()

    return Response({'success': f'{deleted_count} images deleted successfully'}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([CreateTripPermission])
def addDeparture(request, trip_id):
    """End point to add a new departure to a trip."""
    trip = get_object_or_404(Trip, id=trip_id)
    #permission = DepartureTripPermission()
    

    serializer = DepartureTripSerializer(data=request.data)
    if serializer.is_valid():
        departure_trip = serializer.save(trip=trip)  # Assign trip explicitly
        

        notified_admins = Admin.objects.filter(department='owner')
        if request.user.admin.department != 'owner':
            notified_admins = list(notified_admins) + [request.user.admin]

        # Create notifications for each admin (either owner or hotel_manager)
        for admin in notified_admins:
            Notification.objects.create(
                recipient=admin.user,
                type='Trip',
                title='New Departure Trip Added',
                message=f'A new Departure has been added for the Trip named "{trip.title}" by {request.user.admin}.',
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class DepartureDetails(APIView):
    permission_classes = [DepartureTripPermission]

    def get(self, request, trip_id, departure_id):
        """Retrieve a specific DepartureTrip."""
        trip = get_object_or_404(Trip, id=trip_id)
        departure = get_object_or_404(DepartureTrip, id=departure_id, trip=trip)
        serializer = DepartureTripSerializer(departure)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, trip_id, departure_id):
        """Update an existing DepartureTrip."""
        trip = get_object_or_404(Trip, id=trip_id)
        departure = get_object_or_404(DepartureTrip, id=departure_id, trip=trip)
        self.check_object_permissions(request,departure)

        # Get all old data dynamically
        old_data = {
            field.name: getattr(trip, field.name)
            for field in trip._meta.get_fields()
            if not field.is_relation or field.one_to_one or (field.many_to_one and field.related_model)
        }
        serializer = DepartureTripSerializer(departure, data=request.data, partial=True)
        if serializer.is_valid():
            departure = serializer.save()

            notified_admins = Admin.objects.filter(department='owner')
            if request.user.admin.department != 'owner':
                notified_admins = list(notified_admins) + [request.user.admin]

            new_data = serializer.data
            changes = []

            for field, old_value in old_data.items():
                new_value = new_data.get(field)
                if str(old_value) != str(new_value):
                    changes.append(f'{field.replace("_", " ").title()}: "{old_value}" → "{new_value}"')

            if changes:
                changes = "\n".join(changes)
                # Create notifications for each admin (either owner or hotel_manager)
                for admin in notified_admins:
                    Notification.objects.create(
                        recipient=admin.user,
                        type='Trip',
                        title='Departure Trip modified',
                        message=f'The departure trip {departure.location} has been modified for the Trip named "{trip.title}" by {request.user.admin}.',
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, trip_id, departure_id):
        """Delete a specific DepartureTrip."""
        trip = get_object_or_404(Trip, id=trip_id)
        departure = get_object_or_404(DepartureTrip, id=departure_id, trip=trip)
        self.check_object_permissions(request,departure)
        departure.delete()
        return Response({'success': 'Departure deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    
    
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
        
        return profile_data
            
    def get(self,request):
        profile_data =  self.get_my_account(request.user)
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


import uuid
@api_view(['GET'])
def viewProfile(request,id):
    # UUID4 verification
    try:
        uuid.UUID(id, version=4)  # Will raise ValueError if invalid
    except ValueError:
        return Response(
            {"error": "Invalid ID format - must be UUID4"},
            status=status.HTTP_400_BAD_REQUEST
        )
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




#------------- Favorite trips ---------------------------------

@api_view(['POST'])
@permission_classes([CustomerPermissions])
def add_to_favorites(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    customer = request.user.customer
    customer.favorite_trips.add(trip)
    return Response({'message': 'Trip added to favorites.'}, status=200)


@api_view(['DELETE'])
@permission_classes([CustomerPermissions])
def remove_from_favorites(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    customer = request.user.customer
    customer.favorite_trips.remove(trip)
    return Response({'message': 'Trip removed from favorites.'}, status=200)


@api_view(['GET'])
@permission_classes([CustomerPermissions])
def list_favorite_trips(request):
    customer = request.user.customer
    favorite_trips = customer.favorite_trips.all()
    serializer = TripSerializer(favorite_trips, many=True)
    return Response(serializer.data, status=200)


@api_view(['GET'])
@permission_classes([CustomerPermissions])
def is_favorite(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    customer = request.user.customer
    is_fav = customer.favorite_trips.filter(id=trip.id).exists()
    return Response({'is_favorite': is_fav}, status=200)


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
    min_stars = request.GET.get('min_stars')
    max_stars = request.GET.get('max_stars')
    departure_date = request.GET.get('departure_date')
    is_one_way = request.GET.get('is_one_way')
    trip_types = request.GET.get('trip_type')
    experiences = request.GET.get('experience')
    destination_types = request.GET.get('destination_type')
    transports = request.GET.get('transport')
    sort = request.GET.get('sort', 'departure_date')  # Default sort by departure date
    ascending = request.GET.get('ascending', 'true').lower() == 'true'

    # Base query for trips
    query = Q()
    
    # Apply filters
    if destination:
        query &= Q(destination__icontains=destination)
    if min_discount:
        query &= Q(discount__gte=min_discount)
    if max_discount:
        query &= Q(discount__lte=max_discount)
    if min_stars:
        query &= Q(stars_rating__gte=min_stars)
    if max_stars:
        query &= Q(stars_rating__lte=max_stars)
    if departure_date:
        query &= Q(departure_date__date=departure_date)
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
    query &= Q(status = 'coming')
    
    trips = Trip.objects.filter(query)

    # Apply departure city and price filtering
    if departure_city or min_price or max_price:
        departure_query = Q()
        if departure_city:
            departure_query &= Q(location__icontains=departure_city)
        if min_price:
            departure_query &= Q(price__gte=min_price)
            min_price = float(min_price)
        if max_price:
            departure_query &= Q(price__lte=max_price)
            max_price = float(max_price)
        
        departure_trips = DepartureTrip.objects.filter(departure_query).values_list('trip_id', flat=True)
        trips = trips.filter(id__in=departure_trips)

    # Sorting logic
    if sort == "recommended":
        now = timezone.now()
        max_price = DepartureTrip.objects.filter(trip__in=trips).aggregate(max_price=Max('price'))['max_price'] or 1
        max_capacity = trips.aggregate(max_cap=Max('capacity'))['max_cap'] or 1

        for trip in trips:
            min_departure_price = trip.departure_places.aggregate(min_price=Min('price'))['min_price'] or 0
            discount_price = float(float(min_departure_price) * (1 - float(trip.discount or 0) / 100))
            
            stars_score = float(trip.stars_rating or 0) / 5
            price_score = 1 - float(discount_price) / float(max_price)
            availability_score = float(trip.capacity - trip.sold_tickets) / max_capacity
            days_until_departure = (trip.departure_date - now).days
            urgency_score = 1 / float(days_until_departure + 1) if days_until_departure >= 0 else 0
            
            trip.rec_score = (
                0.4 * stars_score +
                -1.2 * price_score +
                0.2 * availability_score +
                0.1 * urgency_score
            )
        
        sorted_trips = sorted(trips, key=lambda x: x.rec_score, reverse=not ascending)
    elif sort == "price":
        if departure_city:
            # Sort by price of the selected departure city
            matching_departures = DepartureTrip.objects.filter(
                trip_id=OuterRef('pk'),
                location__icontains=departure_city
            ).values('price')[:1]

            trips = trips.annotate(
                selected_departure_price=Subquery(matching_departures),
                discount_price=ExpressionWrapper(
                    F('selected_departure_price') * (1 - F('discount') / 100),
                    output_field=FloatField()
                )
            ).filter(selected_departure_price__isnull=False)
        else:
            # Sort by minimum departure price if no city selected
            trips = trips.annotate(
                min_departure_price=Min('departure_places__price'),
                discount_price=ExpressionWrapper(
                    F('min_departure_price') * (1 - F('discount') / 100),
                    output_field=FloatField()
                )
            )
        
        sort_param = 'discount_price' if ascending and ascending==True else '-discount_price'
        sorted_trips = trips.order_by(sort_param)
    elif sort.lower() == 'bestseller':
    # Calculate sold percentage using total trip capacity (not per departure)
        def get_bestseller_score(trip: Trip):
            if trip.capacity == 0:  # Safety check (though your model validates capacity >= 1)
                return 0
            return (trip.sold_tickets / trip.capacity) * 100  # Percentage sold
        
        # Convert queryset to list for Python-side sorting
        trip_list = list(trips)
        sorted_trips = sorted(
            trip_list,
            key=lambda x: get_bestseller_score(x),
            reverse=not ascending  # False=low-to-high, True=high-to-low
        )
    else:
        # Default sorting
        valid_sort_fields = ["departure_date", "stars_rating", "discount"]
        if sort in valid_sort_fields:
            sort_param = sort if ascending else f"-{sort}"
            sorted_trips = trips.order_by(sort_param)
        else:
            sorted_trips = trips.order_by('id')

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

    # Sorting parameters with defaults
    valid_sort_fields = ["departure_date", "stars_rating", "discount", "price", "bestseller"]
    sort_field = request.GET.get("sort", "").lower() 
    ascending = request.GET.get("ascending", "true").lower() == "true"

    if alpha == 0:
        #if the no recommendations are possible, we simply suggest 10 trips from algeria
        recommendations = Trip.objects.filter(country="Algeria").order_by("-stars_rating")[:10]
    else:
        # Get personalized recommendations
        num_recommendations = min(int(alpha * 100), 100)  # Cap at 100 recommendations
        recommendations = get_recommendations(customer.id, num_recommendations, alpha)
        # Convert queryset to list for sorting if needed
        if isinstance(recommendations, list):
            recommendations = recommendations
        else:
            recommendations = list(recommendations)

    # Apply sorting if a valid sort field is provided
    if sort_field == 'price':
        # Get the minimum original price across all departures (ignoring discounts)
        def get_min_price(trip: Trip):
            departure_prices = [float(departure.price) for departure in trip.departure_places.all()]
            return min(departure_prices) if departure_prices else 0
        
        recommendations = sorted(
            recommendations,
            key=lambda trip: get_min_price(trip),
            reverse=not ascending  
        )
    elif sort_field == 'bestseller':
        def get_bestseller_score(trip: Trip):
            if trip.capacity == 0: 
                return 0
            return (trip.sold_tickets / trip.capacity) * 100  
        recommendations = sorted(
            recommendations,
            key=lambda x: get_bestseller_score(x),
            reverse=not ascending  # False=low-to-high, True=high-to-low
        )
    elif sort_field in valid_sort_fields:
        # Handle queryset vs list sorting
        if hasattr(recommendations, 'order_by'):
            order_by_field = sort_field if ascending else f"-{sort_field}"
            recommendations = recommendations.order_by(order_by_field)
        else:
            #Sort
            reverse_sort = not ascending
            recommendations = sorted(
                recommendations,
                key=lambda x: getattr(x, sort_field),
                reverse=reverse_sort
            )

    # Serialize and return recommendations
    serializer = TripSerializer(recommendations, many=True)
    return Response({'recommendations': serializer.data})





#-------------- notifications -----------------------
from .serializers import NotificationSerializer
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    notifications = request.user.notifications.all().order_by('-timestamp')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)



from .serializers import NotificationSerializer
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    notifications = request.user.notifications.all().order_by('-timestamp')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, pk):
    notification = get_object_or_404(Notification, id=pk, recipient=request.user)
    notification.mark_as_read()
    return Response({'success': 'Notification marked as read'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    notification = get_object_or_404(Notification, id=pk, recipient=request.user)
    notification.delete()
    return Response({'success': 'Notification deleted'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_notification_count(request):
    count = request.user.notifications.filter(status='unread').count()
    return Response({'unread_count': count})



@api_view(['GET'])
def get_user_info(request):
    return Response(
        {
            'is_authenticated' : request.user.is_authenticated,
            'is_admin' : hasattr(request.user,'admin'),
            'user_id' : request.user.id,
            'customer_id' : request.user.customer.id if  hasattr(request.userm,'customer') else None,
            'admin_id' : request.user.admin.id if  hasattr(request.userm,'admin') else None,
            'department' : request.user.admin.deparment if hasattr(request.user,'admin') else None,
            'is_customer' : hasattr(request.userm,'customer')

        },
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
def get_trips_for_country(request,country):
    trips = Trip.objects.filter(destination__icontains = country)
    trips_ser = TripSerializer(trips,many=True)
    return Response(trips_ser.data,status=status.HTTP_200_OK)


@api_view(['GET'])
def get_trips_for_country(request):
    country = request.GET.get('country', ' ')
    trips = Trip.objects.filter(destination__icontains = country)
    trips_ser = TripSerializer(trips,many=True)
    return Response(trips_ser.data,status=status.HTTP_200_OK)


@api_view(['GET'])
def get_trips_for_country(request):
    country = request.GET.get('country', ' ')
    trips = Trip.objects.filter(destination__icontains = country)
    trips_ser = TripSerializer(trips,many=True)
    return Response(trips_ser.data,status=status.HTTP_200_OK)



@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def path_not_found(request, path=None):
    return Response(
        {"error": "The page you are looking for does not exist", "path": request.path}, 
        status=status.HTTP_404_NOT_FOUND
    )










#-------------------- background tasks-----------
from .tasks import update_reservation_statuses,update_trip_status,expire_unpaid_reservations,free_occupied_rooms
@permission_classes([IsAuthenticated])
def run_scheduled_tasks(request):
    if not hasattr(request.user,'admin'):
        return Response({'error':'only admins are allowed to execute background tasks'},status=status.HTTP_403_FORBIDDEN)
    update_reservation_statuses()
    update_trip_status()
    expire_unpaid_reservations()
    free_occupied_rooms()
    return Response({'success':'background tasks were executed successfully'},status=status.HTTP_200_OK)

