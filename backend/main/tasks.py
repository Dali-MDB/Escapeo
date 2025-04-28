from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Trip
from reservation.models import TripReservation,HotelReservation
from reservation.signals import get_trip_date_info,get_hotel_date_info
from .mail import send_mail


@shared_task(ignore_result=True)
def update_trip_status():
    now = timezone.now()
    
    # Update ongoing round trips
    Trip.objects.filter(
        is_one_way=False,
        departure_date__lte=now,
        return_date__gt=now
    ).update(status='ongoing')
    
    # Update upcoming trips (both types)
    Trip.objects.filter(
        departure_date__gt=now
    ).update(status='coming')
    
    # Update completed round trips
    Trip.objects.filter(
        is_one_way=False,
        return_date__lt=now
    ).update(status='done')
    
    # Update completed one-way trips
    Trip.objects.filter(
        is_one_way=True,
        departure_date__lte=now
    ).update(status='done')

   

@shared_task
def expire_unpaid_reservations():
    expiry_time = timezone.now() - timedelta(hours=48)

    # Expire unpaid trip reservations
    expired_trip_reservations = TripReservation.objects.filter(
        status='Pending',
        is_paid=False,
        created_at__lte=expiry_time
    ).delete()

   
    # Expire unpaid hotel reservations
    expired_hotel_reservations = HotelReservation.objects.filter(
        status='Pending',
        is_paid=False,
        created_at__lte=expiry_time
    ).delete()

   
    
    


@shared_task
def free_occupied_rooms():
    now = timezone.now().date()  # Compare only dates, not timestamps

    completed_reservations = HotelReservation.objects.filter(
        check_out__lte=now,
        status='confirmed',
    )

    for reservation in completed_reservations:
        hotel = reservation.hotel

        # Free up rooms
        hotel.total_occupied_rooms = max(0, hotel.total_occupied_rooms - reservation.rooms)

        # Mark reservation as over
        reservation.status = 'over'

        hotel.save()
        reservation.save()



@shared_task
def update_reservation_statuses():
    current_time = timezone.now().date()
    current_datetime = timezone.now()

    # Handle HotelReservations: mark as "over" if check_out is in the past and not cancelled
    hotels_updated = HotelReservation.objects.filter(
        status='confirmed',
        check_out__lt=current_time
    ).update(status='over')

    # Handle TripReservations: mark as "over" if date is in the past and not cancelled
    trips_updated = TripReservation.objects.filter(
        status='confirmed',
        date__lt=current_datetime
    ).update(status='over')
