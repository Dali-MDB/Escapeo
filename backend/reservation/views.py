from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from main.models import Trip, DepartureTrip,Hotel
from .models import TripReservation,HotelReservation
from .utils import calculate_trip_price,calculate_hotel_stay
import datetime
import json




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getHotelReservationPrice(request, hotel_id):
    hotel = get_object_or_404(Hotel, id=hotel_id)
    
    try:
        check_in = datetime.strptime(request.GET['check_in'], '%Y-%m-%d').date()
        check_out = datetime.strptime(request.GET['check_out'], '%Y-%m-%d').date()
        room_details = request.GET['room_details']
    except (KeyError, ValueError, json.JSONDecodeError):
        return Response({'error': 'Invalid date format or room details'}, status=400)
    
    result = calculate_hotel_stay(hotel, check_in, check_out, room_details, request.user.customer)
    if 'error' in result or 'errors' in result:
        return Response(result, status=400)
    
    return Response({
        'total_price': result['total_price'],
        'total_nights': result['total_nights'],
        'room_types': list(room_details.keys())
    })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hotel_reservation_payment_init(request, hotel_id):
    hotel = get_object_or_404(Hotel, id=hotel_id)
    
    try:
        check_in = datetime.strptime(request.data['check_in'], '%Y-%m-%d').date()
        check_out = datetime.strptime(request.data['check_out'], '%Y-%m-%d').date()
        room_details = request.data['room_details']
        submitted_price = float(request.data['total_price'])
        guests = int(request.data.get('guests',1))
    except (KeyError, ValueError) as e:
        return Response({'errors': f'Invalid data: {str(e)}'}, status=400)
    
    # Use shared calculation
    result = calculate_hotel_stay(hotel, check_in, check_out, room_details, request.user.customer)
    if 'error' in result or 'errors' in result:
        return Response(result, status=400)
    
    # Verify price matches
    if abs(float(submitted_price) - float(result['total_price'])) > 0.01:
        return Response({
            'errors': 'Price mismatch',
            'expected': result['total_price'],
            'submitted': submitted_price
        }, status=400)
    
    # Create reservation
    reservation = HotelReservation.objects.create(
        user=request.user.customer.id,
        hotel=hotel,
        check_in=check_in,
        check_out=check_out,
        room_details=room_details,
        total_price=result['total_price'],
        total_nights=result['total_nights'],
        guests = guests
    )
    
    # Update inventory
    hotel_rooms = hotel.rooms
    for room_type, details in room_details.items():
        hotel_rooms[room_type]['available'] -= details['quantity']
    hotel.rooms = hotel_rooms
    hotel.save()
    
    return Response({
        'reservation_id': reservation.id,
        'confirmed_price': result['total_price'],
        'dates': {
            'check_in': check_in,
            'check_out': check_out
        }
    })





# GET endpoint (unchanged but cleaner)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getTripReservationPrice(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    departure_trip = get_object_or_404(DepartureTrip, trip=trip, id=request.GET.get("departure_trip_id"))
    tickets = int(request.GET.get("tickets", 1))
    
    result = calculate_trip_price(trip, departure_trip, tickets, request.user.customer)
    if 'errors' in result:
        return Response(result, status=400)
    
    return Response({
        "total_trip_price": result['total_price'],
        "loyalty_discount": result['loyalty_discount'],
        "trip_discount": result['trip_discount'],
        "final_discount": result['final_discount']
    })

# POST endpoint (now with shared logic)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trip_reservation_payment_init(request, trip_id):
    # Get basic data
    trip = get_object_or_404(Trip, id=trip_id)
    departure_trip = get_object_or_404(DepartureTrip,trip=trip, id=request.data.get('departure_trip'))
    tickets = int(request.data.get('tickets', 1))
    submitted_price = float(request.data.get('total_price'))
    
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
    
    # Create reservation
    reservation = TripReservation.objects.create(
        user=request.user.customer.id,
        total_price=result['total_price'],  # Use calculated price, not submitted
        trip=trip,
        departure_trip=departure_trip,
        tickets=tickets
    )
    
    # Update inventory
    trip.sold_tickets += tickets
    departure_trip.sold_tickets += tickets
    trip.save()
    departure_trip.save()
    
    return Response({
        "reservation_id": reservation.id,
        "confirmed_price": result['total_price']
    })





