from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from main.models import Trip, DepartureTrip,Hotel
from .models import TripReservation,HotelReservation
from .utils import calculate_trip_price,calculate_hotel_stay
from datetime import datetime
import json
from rest_framework import status
from main.permissions import CustomerPermissions
from rest_framework.exceptions import ValidationError
from .serializers import HotelReservationSerializer,TripReservationSerializer,HotelReservationWithTripSerializer
from main.serializers import HotelSerializer
from datetime import date
from decimal import Decimal
from main.models import Notification,Admin
from .signals import handle_hotel_notification,handle_trip_notification,notify_failed_trip_payment,handle_cancelled_hotel_reservation,handle_cancelled_trip_reservation

from django.utils import timezone




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getHotelReservationPrice(request, hotel_id):
    hotel = get_object_or_404(Hotel, id=hotel_id)
    
    try:
        check_in = datetime.strptime(request.GET['check_in'], '%Y-%m-%d').date()
        check_out = datetime.strptime(request.GET['check_out'], '%Y-%m-%d').date()
        rooms = int(request.GET['rooms'])
    except (KeyError, ValueError, json.JSONDecodeError):
        return Response({'error': 'Invalid date format or room details'}, status=400)
    
    if check_in >= check_out:
        return Response({'error' : 'check in can not be after checkout'},status=status.HTTP_400_BAD_REQUEST)
    total_nights = (check_out - check_in).days
    total_price = total_nights*hotel.price_per_night*rooms

    return Response({
        'total_price': total_price,
        'total_nights': total_nights,
        'total_rooms': rooms,
    })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hotel_reservation_payment_init(request, hotel_id):
    hotel = get_object_or_404(Hotel, id=hotel_id)
    try:
        check_in = datetime.strptime(request.data['check_in'], '%Y-%m-%d').date()
        check_out = datetime.strptime(request.data['check_out'], '%Y-%m-%d').date()
        rooms = request.data['rooms']
        submitted_price = float(request.data['total_price'])
        guests = int(request.data.get('guests',1))
    except (KeyError, ValueError) as e:
        return Response({'errors': f'Invalid data: {str(e)}'}, status=400)
    
    if rooms > (hotel.total_rooms - hotel.total_occupied_rooms):
        ValidationError(f"Only {hotel.total_rooms - hotel.total_occupied_rooms} rooms available")

    total_nights = (check_out - check_in).days
    total_price = total_nights*hotel.price_per_night*rooms

    
    # Verify price matches
    if abs(float(submitted_price) - float(total_price)) > 0.01:
        return Response({
            'errors': 'Price mismatch',
            'expected': total_price,
            'submitted': submitted_price
        }, status=400)
    
  
    reservation = HotelReservation.objects.create(
        user=request.user.customer,
        hotel=hotel,
        check_in=check_in,
        check_out=check_out,
        rooms=rooms,
        total_price=total_price,
        total_nights=total_nights,
        guests = guests
    )

    
    # Update inventory
    hotel.total_occupied_rooms += rooms
    hotel.save()

    serializer = HotelReservationSerializer(reservation)
    return Response(serializer.data,status=status.HTTP_201_CREATED)





# GET endpoint (unchanged but cleaner)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getTripReservationPrice(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    
    #add status check
    if trip.status != 'coming' or trip.departure_date >= timezone.now().date():
        return Response({'error':'you can not make a reservation for this trip since its departue date had already passed'},status=status.HTTP_400_BAD_REQUEST)
    departure_trip = get_object_or_404(DepartureTrip, trip=trip, id=request.GET.get("departure_trip_id"))
    tickets = int(request.GET.get("tickets", 1))
    
    result = calculate_trip_price(trip, departure_trip, tickets, request.user.customer)
    if 'errors' in result:
        return Response(result, status=400)
    
    return Response({
        "total_trip_price": result['total_price'],
        "loyalty_discount": result['loyalty_discount'],
        "trip_discount": result['trip_discount'],
        "taken_from_wallet" : result["taken_from_wallet"],
        "final_discount": result['final_discount']
    })




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trip_reservation_payment_init(request, trip_id):
    # Get basic data
    trip = get_object_or_404(Trip, id=trip_id)

    print(request.data.get('departure_trip_id'))


    #add status check
    if trip.status != 'coming' or trip.departure_date >= timezone.now().date():
        return Response({'error':'you can not make a reservation for this trip since its departue date had already passed'},status=status.HTTP_400_BAD_REQUEST)
    

    departure_trip = get_object_or_404(DepartureTrip, trip=trip, id=request.GET.get('departure_trip_id'))
    tickets = int(request.data.get('tickets', 1))
    submitted_price = float(request.data.get('total_price'))
    
    # Check if hotel_reservation_id is provided
    hotel_reservation_id = request.data.get('hotel_reservation_id')
    hotel_reservation = None
    hotel_price = 0  # Default to 0 if no hotel reservation

    if hotel_reservation_id:
        hotel_reservation = get_object_or_404(HotelReservation, id=hotel_reservation_id, user=request.user.customer.id)
        if hasattr(hotel_reservation,'trip_reservation'):
            raise ValidationError("this hotel reservation is already linked to another trip reservation")
        hotel_price = hotel_reservation.total_price  # Get hotel reservation price

    # Use shared calculation
    result = calculate_trip_price(trip, departure_trip, tickets, request.user.customer)
    if 'errors' in result:
        return Response(result, status=400)

    # Verify price matches
    if abs(float(submitted_price) - float(result['total_price'])) > 0.01:
        return Response(
            {"errors": f"Price mismatch. Expected: {result['total_price']}, Received: {submitted_price}"},
            status=400
        )

    # Calculate total price to pay (trip + hotel)
    total_price_to_pay = float(result['total_price']) + float(hotel_price)
    

    
    # Create reservation
    reservation = TripReservation.objects.create(
        user=request.user.customer,
        total_price=result['total_price'],  # Use calculated price, not submitted
        trip=trip,
        departure_trip=departure_trip,
        tickets=tickets,
        hotel_reservation=hotel_reservation if hotel_reservation else None, # Link the hotel reservation
        date = trip.departure_date,
    )

    # Update inventory
    trip.sold_tickets += tickets
    departure_trip.sold_tickets += tickets
    trip.save()
    departure_trip.save()

    #add the trip to purchased trips list of the user
    request.user.customer.purchased_trips.add(trip)



    
    #return the reservation
    serializer = TripReservationSerializer(reservation)
    return Response(
        data={
        'reservation':serializer.data,
        'total_price' : round(total_price_to_pay,2),
        }
        ,status=status.HTTP_201_CREATED
        )





@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simulate_payment_webhook(request, reservation_id):
    """Simulate payment confirmation webhook"""
    
    paid = bool(request.data.get('paid',False))
    reservation_type = request.data.get('reservation_type','trip')
    if not paid:
        return Response({'error':'payment failed'},status=status.HTTP_400_BAD_REQUEST)
    
    total_price = 0
    if reservation_type == 'hotel':
        reservation = HotelReservation.objects.get(id=reservation_id, user=request.user.customer)
        total_price = reservation.total_price
    elif reservation_type == 'trip':
        reservation = TripReservation.objects.get(id=reservation_id, user=request.user.customer)
        total_price = reservation.total_price
        if hasattr(reservation,'hotel_reservation') and reservation.hotel_reservation:
            total_price += reservation.hotel_reservation.total_price
    else:
        return Response({'error': 'Invalid type'}, status=status.HTTP_400_BAD_REQUEST)
    
    #check if it is already paid
    if reservation.status == 'confirmed':
        return Response({'details':'this reservation has already been paid'},status=status.HTTP_409_CONFLICT)
    
    if reservation.simulate_payment():
        customer = request.user.customer
        customer.balance = 0 if total_price >= customer.balance else (customer.balance - total_price)    #adjust the custome wallet

        if reservation_type=='hotel':
            handle_hotel_notification(reservation,True)
        else:   #trip 
            handle_trip_notification(reservation,True)

        return Response({'status': 'payment was successful'},status=status.HTTP_202_ACCEPTED)
    
    #paiment failed 
    if reservation_type == 'hotel':
        Notification.objects.create(
            user=request.user,
            type='Payment',
            title='Failed hotel reservation payment',
            message=f'your payment for the reservation at {reservation.hotel} (check-in : {reservation.check_in}- check-out: {reservation.check_out}) had faild, review or actions or contact the staff if you think that we have done a mistake.',
        )
    else:
        notify_failed_trip_payment(reservation)
    return Response({'error': 'Payment simulation failed'}, status=status.HTTP_400_BAD_REQUEST)
    




@api_view(['DELETE'])
@permission_classes([IsAuthenticated,CustomerPermissions])
def cancelHotelReservation(request,reservation_id):
    customer = request.user.customer
    reservation = get_object_or_404(HotelReservation, id=reservation_id, user=customer)


    if reservation.status == 'cancelled':
        return Response({
            'message': 'This reservation has already been cancelled',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if reservation.status == 'over':
        return Response({
            'message': 'This reservation has already been finished',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if reservation.status == 'pending':
        reservation.cancel()
        handle_cancelled_hotel_reservation(reservation,False)
        return Response({
            'message': 'Pending reservation cancelled. No refund issued.',
        }, status=status.HTTP_200_OK)
        


    customer.balance += reservation.total_price    #total refund on hotels
    customer.save()
    reservation.cancel()
    handle_cancelled_hotel_reservation(reservation,True)
    return Response(
        {
            'message': 'Reservation cancelled successfully.',
            'hotel_refund' : reservation.total_price,
        },status=status.HTTP_200_OK

    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, CustomerPermissions])
def cancelTripReservation(request, reservation_id):
    customer = request.user.customer
    cancel_hotel = bool(request.data.get('cancel_hotel', True))
    
    # Get the reservation and check its status
    reservation = get_object_or_404(TripReservation, id=reservation_id, user=customer)
    
    # Check if the reservation is already cancelled or over
    if reservation.status == 'cancelled':
        return Response({
            'message': 'This reservation has already been cancelled',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if reservation.status == 'over':
        return Response({
            'message': 'This reservation has already been finished',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # If the status is pending (unpaid), just cancel without refund
    if reservation.status == 'pending':
        reservation.cancel(cancel_hotel)
        handle_cancelled_trip_reservation(reservation,False)
        return Response({
            'message': 'Pending reservation cancelled. No refund issued.',
        }, status=status.HTTP_200_OK)

    today = date.today()
    departure_date = reservation.date
    days_left = (departure_date - today).days

   # Calculate refund based on how close to departure date
    if days_left > 30:
        refund_percent = 1.0  # Full refund
    elif 21 <= days_left <= 30:
        refund_percent = 0.75  # 75% refund
    elif 14 <= days_left < 21:
        refund_percent = 0.5  # 50% refund
    elif 7 <= days_left < 14:
        refund_percent = 0.25  # 25% refund
    else:
        refund_percent = 0.0  # No refund if it's less than 7 days


    trip_price = reservation.total_price
    trip_refund = float(trip_price) * float(refund_percent)

    hotel_refund = 0
    if cancel_hotel and reservation.hotel_reservation:
        hotel_refund = reservation.hotel_reservation.total_price

    total_refund = trip_refund + float(hotel_refund)

    # Update the customer's balance
    customer.balance += Decimal(total_refund)
    customer.save()

    handle_cancelled_trip_reservation(
        reservation=reservation,
        paid=True,
        trip_refund=trip_refund,
        hotel_refund=hotel_refund,
        total_refund=total_refund
    )

    # Call the cancel method, which will handle status updates and hotel cancellations
    reservation.cancel(cancel_hotel)
    

    return Response({
        'message': 'Reservation cancelled successfully.',
        'trip_refund': trip_refund,
        'hotel_refund': hotel_refund,
        'total_refund': total_refund,
        'days_before_departure': days_left
    }, status=status.HTTP_200_OK)


    
from .permissions import acceptHotelReservationPermission,acceptTripReservationPermission
@api_view(['POST'])
@permission_classes([acceptHotelReservationPermission])
def confirmHotelReservationManually(request,reservation_id):
    reservation = get_object_or_404(HotelReservation,id=reservation_id)
    reservation.status = 'confirmed'
    reservation.save()

    # Notify the user about their confirmed hotel reservation
    handle_hotel_notification(reservation, paid=True)
    return Response({'success':'the hotel reservation has been validated and confirmed'})


@api_view(['POST'])
@permission_classes([acceptTripReservationPermission])
def confirmTripReservationManually(request,reservation_id):
    reservation = get_object_or_404(TripReservation,id=reservation_id)
    permission = acceptTripReservationPermission()
    permission.has_object_permission(request,None,reservation)
    reservation.status = 'confirmed'
    reservation.save()

    # Notify the user about their confirmed trip reservation
    handle_trip_notification(reservation, paid=True)
    return Response({'success':'the trip reservation has been validated and confirmed'})
    
    







from django.db.models import Prefetch
@api_view(['GET'])
@permission_classes([IsAuthenticated, CustomerPermissions])
def view_my_reservations(request):
    user = request.user.customer
    
    # Get all hotel reservations not linked to any trip
    standalone_hotel_reservations = HotelReservation.objects.filter(
        user=user,
        trip_reservation__isnull=True
    ).select_related('hotel')
    
    # Get all trip reservations with their linked hotel reservations
    trip_reservations = TripReservation.objects.filter(
        user=user
    ).select_related(
        'trip',
        'departure_trip'
    ).prefetch_related(
        Prefetch('hotel_reservation', queryset=HotelReservation.objects.select_related('hotel'))
    )
    
    # Organize by status
    def organize_by_status(queryset):
        result = {
            'pending': [],
            'confirmed': [],
            'over': [],
            'cancelled' : []
        }
        for item in queryset:
            result[item.status].append(item)
        return result
    
    # Prepare response data
    response_data = {
        'hotel_reservations': organize_by_status(standalone_hotel_reservations),
        'trip_reservations': organize_by_status(trip_reservations),
    }
    
    # Serialize the data (you'll need to create these serializers)
    from .serializers import HotelReservationSerializer, TripReservationSerializer
    
    serialized_data = {
        'hotel_reservations': {
            'pending': HotelReservationSerializer(
                response_data['hotel_reservations']['pending'],
                many=True
            ).data,
            'confirmed': HotelReservationSerializer(
                response_data['hotel_reservations']['confirmed'],
                many=True
            ).data,
            'over': HotelReservationSerializer(
                response_data['hotel_reservations']['over'],
                many=True
            ).data,
            'cancelled': HotelReservationSerializer(
                response_data['hotel_reservations']['cancelled'],
                many=True
            ).data,
        },
        'trip_reservations': {
            'pending': TripReservationSerializer(
                response_data['trip_reservations']['pending'],
                many=True
            ).data,
            'confirmed': TripReservationSerializer(
                response_data['trip_reservations']['confirmed'],
                many=True
            ).data,
            'over': TripReservationSerializer(
                response_data['trip_reservations']['over'],
                many=True
            ).data,
            'cancelled': TripReservationSerializer(
                response_data['trip_reservations']['cancelled'],
                many=True
            ).data,
        }
    }
    
    return Response(serialized_data)
    



@api_view(['GET'])
def get_nearby_hotels(request,trip_id):
    trip = get_object_or_404(Trip,id=trip_id)
    if hasattr(trip,'hotel') and trip.hotel:
        return Response(HotelSerializer(trip.hotel).data)

    destination = trip.destination.split(',')[0].strip()
    hotels = Hotel.objects.filter(location__icontains = destination).order_by('-stars_rating', 'price_per_night')
    if not hotels.exists():
        return Response({'details':'no nearby hotels were found please try Booking.com'})
    hotel_serializer = HotelSerializer(hotels,many=True)
    
    return Response(hotel_serializer.data)







#------------------------------ viewing reservations
from main.permissions import CreateHotelPermission,CreateTripPermission
@api_view(['GET'])
@permission_classes([CreateHotelPermission])
def pending_hotel_reservations(request):
    # Pending reservations WITH trip association
    with_trip = HotelReservation.objects.filter(
        status='pending',
        trip_reservation__isnull=False
    ).select_related('hotel', 'user', 'trip_reservation')
    
    # Pending reservations WITHOUT trip association
    without_trip = HotelReservation.objects.filter(
        status='pending',
        trip_reservation__isnull=True
    ).select_related('hotel')
    
    
    return Response({
        'with_trip': HotelReservationWithTripSerializer(with_trip, many=True).data,
        'without_trip': HotelReservationSerializer(without_trip, many=True).data
    })



@api_view(['GET'])
@permission_classes([CreateTripPermission])
def pending_trip_reservations(request):
    # With hotel reservation
    with_hotel = TripReservation.objects.filter(
        status='pending',
        hotel_reservation__isnull=False
    ).select_related('trip', 'hotel_reservation')
    
    # Without hotel reservation
    without_hotel = TripReservation.objects.filter(
        status='pending',
        hotel_reservation__isnull=True
    ).select_related('trip')
    
    return Response({
        'with_hotel_reservation': TripReservationSerializer(with_hotel, many=True).data,
        'without_hotel_reservation': TripReservationSerializer(without_hotel, many=True).data
    })



from main.permissions import TripPermission
@api_view(['GET'])
@permission_classes([TripPermission])
def pending_reservation_for_trip(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    
    permission = TripPermission()
    permission.has_object_permission(request,None,trip)
    
    # With hotel reservation
    with_hotel = TripReservation.objects.filter(
        trip=trip,
        status='pending',
        hotel_reservation__isnull=False
    ).select_related('hotel_reservation')
    
    # Without hotel reservation
    without_hotel = TripReservation.objects.filter(
        trip=trip,
        status='pending',
        hotel_reservation__isnull=True
    )
    
    return Response({
        'with_hotel_reservation': TripReservationSerializer(with_hotel, many=True).data,
        'without_hotel_reservation': TripReservationSerializer(without_hotel, many=True).data,
        'trip_id': trip_id
    })
    