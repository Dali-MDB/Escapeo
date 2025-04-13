from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from .models import Trip, Reservation, Hotel

@shared_task
def update_trip_status():
    now = timezone.now()

    Trip.objects.filter(
        departure_date__lte=now,
        return_date__gt=now
    ).update(status='ongoing')

    Trip.objects.filter(
        departure_date__gt=now
    ).update(status='coming')
   

@shared_task
def expire_unpaid_reservations():
    expiry_time=timezone.now() - timedelta(hours=48)

    expired_reservations = Reservation.objects.filter(
        status='Pending',
        is_paid=False,
        created_at__lte=expiry_time
    )

    for reservation in expired_reservations:
        send_mail(
             'Reservation Expired',
            f'Your reservation for {reservation.trip.title} has expired as payment was not completed.',
            'travelagencyt36@gmail.com',
            [reservation.user.user.email],
            fail_silently=True,
        )

    #DELETE EXPIRED RESERVATIONS
    count = expired_reservations.delete()[0]
    print(f"Deleted {count} expired reservations")


@shared_task
def free_occupied_rooms():
    now = timezone.now()


    completed_reservations = Reservation.objects.filter(
        trip__return_date__lte=now,
        status='Confirmed',
        hotel__isnull=False
    )

    for reservation in completed_reservations:
        hotel = reservation.hotel 
        rooms = reservation.rooms

        for room_type, details in rooms.items():
            if room_type in hotel.rooms:
                hotel.rooms[room_type]['available']+=details['quantity']
                hotel.total_occupied_rooms -= details['quantity']
        

        reservation.status = 'Completed'
        reservation.save()
        hotel.save()

        print(f"Freed rooms for reservation {reservation.id} at {hotel.name}")

