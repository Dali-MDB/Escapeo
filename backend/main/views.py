'''from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view,APIView,permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomerSerializer,TripSerializer,HotelSerializer
from django.contrib.auth import authenticate,get_user_model
from rest_framework.permissions import IsAuthenticated

from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Trip , Hotel
from .permissions import TripPermission,CreateTripPermission

from rest_framework.views import APIView
import urllib.parse


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


#------------------------------hotels----------------------------------------------
# -------- Views --------
@api_view(['POST'])
@permission_classes([IsAuthenticated, CreateTripPermission])
def addHotel(request):
    request.data['created_by'] = request.user.admin.id if request.user.admin else None
    hotel_ser = HotelSerializer(data=request.data)
    if hotel_ser.is_valid():
        hotel_ser.save()
        return Response({'success': 'A new hotel has been added successfully'}, status=status.HTTP_201_CREATED)
    return Response(hotel_ser.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def allHotels(request):
    hotels = Hotel.objects.all()
    serializer = HotelSerializer(hotels, many=True)
    return Response(serializer.data)


class HotelDetails(APIView):
    permission_classes = [TripPermission]

    def get(self, request, pk):
        hotel = get_object_or_404(Hotel, id=pk)
        return Response(HotelSerializer(hotel).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        hotel = get_object_or_404(Hotel, id=pk)
        hotel_ser = HotelSerializer(hotel, data=request.data, partial=True)
        if hotel_ser.is_valid():
            hotel_ser.save()
            return Response(hotel_ser.data, status=status.HTTP_200_OK)
        return Response(hotel_ser.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        get_object_or_404(Hotel, id=pk).delete()
        return Response({'success': 'Deletion was successful'}, status=status.HTTP_204_NO_CONTENT)

#------------------------------- Booking--------------------------------------------
    

class BookingAPIView(APIView):
    def post(self, request):
        
        data = request.data
        destination = data.get("destination")
        checkin = data.get("checkin")
        checkout = data.get("checkout")
        adultes = data.get("adultes")
        minprice = data.get("minprice")
        maxprice = data.get("maxprice")
        enfants = data.get("enfants", 0)
        devise = data.get("devise", "USD")
        etoiles = data.get("etoiles")
        type_etablissement = data.get("type_etablissement")
        note_client = data.get("note_client")
        annulation_gratuite = data.get("annulation_gratuite", False)

        
        try:
            adultes = int(adultes)
            minprice = int(minprice)
            maxprice = int(maxprice)
            enfants = int(enfants)
            etoiles = int(etoiles) if etoiles else None
            note_client = int(note_client) if note_client else None
        except (ValueError, TypeError):
            return Response({"error": "Invalid numeric parameters"}, status=status.HTTP_400_BAD_REQUEST)

        
        url = self.generate_booking_url(destination, checkin, checkout, adultes, minprice, maxprice, 
                                        enfants, devise, etoiles, type_etablissement, note_client, 
                                        annulation_gratuite)

        return Response({"booking_url": url}, status=status.HTTP_200_OK)

    def generate_booking_url(self, destination, checkin, checkout, adultes, minprice, maxprice, 
                             enfants, devise, etoiles, type_etablissement, note_client, 
                             annulation_gratuite):
        base_url = "https://www.booking.com/searchresults.html?"
        params = {
            "ss": destination,
            "checkin": checkin,
            "checkout": checkout,
            "group_adults": adultes,
            "group_children": enfants,
            "no_rooms": 1,
            "selected_currency": devise
        }

        filtres = []

        if minprice is not None and maxprice is not None:
            filtres.append(f"price%3D{devise}-{minprice}-{maxprice}-1")

        if etoiles in [1, 2, 3, 4, 5]:
            filtres.append(f"class%3D{etoiles}")

        etablissements = {"hotel": 204, "appartement": 216, "auberge": 222, "maison d'hotes": 201}
        if type_etablissement in etablissements:
            filtres.append(f"ht_id%3D{etablissements[type_etablissement]}")

        notes_clients = {9: 90, 8: 80, 7: 70, 6: 60}
        if note_client in notes_clients:
            filtres.append(f"review_score%3D{notes_clients[note_client]}")

        if annulation_gratuite:
            filtres.append("fc%3D2")

        if filtres:
            params["nflt"] = ";".join(filtres)

        return base_url + urllib.parse.urlencode(params, safe="=;%")




#--------------------------payment paypal-------------------------
import paypalrestsdk
from django.conf import settings

paypalrestsdk.configure({
    "mode": settings.PAYPAL_MODE,  # "sandbox" ou "live"
    "client_id": settings.PAYPAL_CLIENT_ID,
    "client_secret": settings.PAYPAL_CLIENT_SECRET
})

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import paypalrestsdk
from django.http import JsonResponse


@api_view(["GET"])
def create_payment(request):
    payment = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://127.0.0.1:8000/payment/success/",
            "cancel_url": "http://127.0.0.1:8000/payment/cancel/"
        },
        "transactions": [{
            "amount": {
                "total": "10.00",
                "currency": "USD"
            },
            "description": "Paiement test pour un voyage"
        }]
    })

    if payment.create():
        for link in payment.links:
            if link.rel == "approval_url":
                return JsonResponse({"approval_url": link.href})  # On renvoie l'URL PayPal
    else:
        return JsonResponse({"error": payment.error}, status=400)

@api_view(["GET"])
def execute_payment(request):
    """
    Vérifie et capture le paiement après validation de l'utilisateur
    """
    payment_id = request.GET.get("paymentId")
    payer_id = request.GET.get("PayerID")

    payment = paypalrestsdk.Payment.find(payment_id)
    if payment.execute({"payer_id": payer_id}):
        return Response({"message": "Paiement réussi !", "payment_id": payment_id})
    else:
        return Response({"error": payment.error}, status=400)




@api_view(["POST"])
@permission_classes([])  # Ajouter les permissions selon ton besoin
def create_trip_payment(request, trip_id):
    """
    Crée un paiement PayPal pour un voyage spécifique.
    """
    trip = get_object_or_404(Trip, id=trip_id)
    user = request.user
    amount = trip.price  # Prix du voyage

    # Création du paiement PayPal
    payment = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "transactions": [{
            "amount": {
                "total": str(amount),
                "currency": "USD"
            },
            "description": f"Payment for trip: {trip.title}"
        }],
        "redirect_urls": {
            "return_url": "http://localhost:8000/api/payment/success/",
            "cancel_url": "http://localhost:8000/api/payment/cancel/"
        }
    })

    if payment.create():
        # Enregistrer le paiement en base de données
        payment_record = Payment.objects.create(
            trip=trip,
            user=user,
            payment_id=payment.id,
            amount=amount,
            status="pending"
        )

        # Renvoyer l'URL pour payer
        for link in payment["links"]:
            if link["rel"] == "approval_url":
                return Response({"approval_url": link["href"]}, status=status.HTTP_201_CREATED)

    return Response({"error": "Payment creation failed"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def execute_trip_payment(request):
    """
    Vérifie et capture le paiement après validation de l'utilisateur.
    """
    payment_id = request.GET.get("paymentId")
    payer_id = request.GET.get("PayerID")

    payment = paypalrestsdk.Payment.find(payment_id)
    if payment.execute({"payer_id": payer_id}):
        # Mise à jour du paiement en base de données
        payment_record = get_object_or_404(Payment, payment_id=payment_id)
        payment_record.status = "completed"
        payment_record.save()

        return Response({"message": "Paiement réussi !", "payment_id": payment_id}, status=status.HTTP_200_OK)
    
    return Response({"error": payment.error}, status=status.HTTP_400_BAD_REQUEST)








 
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Reservation1
from .serializers import ReservationSerializer1

class CreateReservationView1(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ReservationSerializer1(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreatePaymentView1(APIView):
    def post(self, request, *args, **kwargs):
        reservation_id = request.data.get('reservation_id')
        try:
            reservation = Reservation1.objects.get(id=reservation_id)
        except Reservation.DoesNotExist:
            return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)

        paypal_url = f"https://api.sandbox.paypal.com/v2/checkout/orders" if settings.PAYPAL_ENVIRONMENT == 'sandbox' else "https://api.paypal.com/v2/checkout/orders"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.get_paypal_access_token()}'
        }
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "amount": {
                        "currency_code": "USD",
                        "value": str(reservation.amount)
                    }
                }
            ],
            "application_context": {
                "return_url": "http://localhost:8000/payment/success/",
                "cancel_url": "http://localhost:8000/payment/cancel/"
            }
        }

        response = requests.post(paypal_url, json=payload, headers=headers)
        if response.status_code == 201:
            payment_data = response.json()
            reservation.payment_id = payment_data['id']
            reservation.save()
            return Response({'approval_url': next(link['href'] for link in payment_data['links'] if link['rel'] == 'approve')})
        else:
            return Response({'error': 'Failed to create payment'}, status=status.HTTP_400_BAD_REQUEST)

    def get_paypal_access_token(self):
        auth_url = f"https://api.sandbox.paypal.com/v1/oauth2/token" if settings.PAYPAL_ENVIRONMENT == 'sandbox' else "https://api.paypal.com/v1/oauth2/token"
        auth_response = requests.post(auth_url, auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET), data={'grant_type': 'client_credentials'})
        return auth_response.json()['access_token']

class PaymentSuccessView1(APIView):
    def get(self, request, *args, **kwargs):
        payment_id = request.query_params.get('paymentId')
        try:
            reservation = Reservation1.objects.get(payment_id=payment_id)
            reservation.payment_status = 'completed'
            reservation.save()
            return Response({'status': 'Payment successful'})
        except Reservation.DoesNotExist:
            return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)

class PaymentCancelView1(APIView):
    def get(self, request, *args, **kwargs):
        payment_id = request.query_params.get('paymentId')
        try:
            reservation = Reservation1.objects.get(payment_id=payment_id)
            reservation.payment_status = 'cancelled'
            reservation.save()
            return Response({'status': 'Payment cancelled'})
        except Reservation.DoesNotExist:
            return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND) '''




#------------------------------------------------------------

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
from .models import Trip,TripImage,DepartureTrip,Hotel,HotelImages
from .permissions import TripPermission,CreateTripPermission,addAdminPermission,CustomerPermissions,DepartureTripPermission,CreateHotelPermission,HotelPermission


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



#------------------------------hotels----------------------------------------------

# ---------------------- Hotels ------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated, CreateHotelPermission])
def addHotel(request):
    hotel_ser = HotelSerializer(data=request.data)
    if hotel_ser.is_valid():
        hotel_ser.save()
        return Response({'success': 'A new hotel has been added successfully'}, status=status.HTTP_201_CREATED)
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
        hotel_ser = HotelSerializer(hotel, data=request.data, partial=True)
        if hotel_ser.is_valid():
            hotel_ser.save()
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





#----------------------- Trips -------------------------------
@api_view(['POST'])
@permission_classes([CreateTripPermission])
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
    

    def get(self, request, pk):
        trip = self.get_trip(pk)
        self.check_object_permissions(request, trip)  # ✅ Ensure permission check
        trip_ser = TripSerializer(trip)
        return Response(trip_ser.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        trip = self.get_trip(pk)
        self.check_object_permissions(request, trip)  # ✅ Ensure permission check

        trip_ser = TripSerializer(trip, data=request.data, partial=True)
        if trip_ser.is_valid():
            trip_ser.save()
            return Response(trip_ser.data, status=status.HTTP_200_OK)

        return Response(trip_ser.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        trip = self.get_trip(pk)
        self.check_object_permissions(request, trip)  # ✅ Ensure permission check

        trip.delete()
        return Response({'success': 'Deletion was successful'}, status=status.HTTP_204_NO_CONTENT)
    

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
        serializer.save(trip=trip)  # Assign trip explicitly
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

        serializer = DepartureTripSerializer(departure, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
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
    trip_types = request.GET.getlist('trip_type')
    experiences = request.GET.getlist('experience')
    destination_types = request.GET.getlist('destination_type')
    transports = request.GET.getlist('transport')
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

    # Sorting parameters
    valid_sort_fields = ["departure_date", "stars_rating", "discount"]
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
    if sort_field.lower() == 'price':
        # Get the minimum original price across all departures (ignoring discounts)
        def get_min_price(trip: Trip):
            return min(float(departure.price) for departure in trip.departure_places.all())
        
        # Sort by the minimum original price
        recommendations = sorted(
            recommendations,
            key=lambda trip: get_min_price(trip),
            reverse=not ascending  
        )

    if sort_field in valid_sort_fields:
        order_by_field = sort_field if ascending else f"-{sort_field}"
        recommendations = recommendations.order_by(order_by_field)

    if sort_field.lower() == 'bestseller':
        def get_bestseller_score(trip: Trip):
            if trip.capacity == 0:  # Prevent division by zero
                return 0
            return (trip.sold_tickets / trip.capacity) * 100  # Percentage
        
        recommendations = sorted(
            recommendations,
            key=lambda x: get_bestseller_score(x),
            reverse=not ascending  # False=low-to-high, True=high-to-low
        )

    # Serialize and return recommendations
    recommended_trips = TripSerializer(recommendations, many=True)
    return Response({'recommendations': recommended_trips.data})











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


@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def path_not_found(request, path=None):
    return Response(
        {"error": "The page you are looking for does not exist", "path": request.path}, 
        status=status.HTTP_404_NOT_FOUND
    )