from django.shortcuts import render
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
'''import paypalrestsdk
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
'''







 
'''# views.py
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
            return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)  '''



#---------------------------stripe payment---------------------------------