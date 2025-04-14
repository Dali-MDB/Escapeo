from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.utils import timezone
from main.models import Hotel,Trip
from reservation.models import HotelReservation,TripReservation
from main.models import Notification
from main.models import Admin

@receiver(pre_delete, sender=Hotel)
def handle_hotel_deletion(sender, instance, **kwargs):
    # Notify admin
    notify_admins_hotels(instance)
    
    # Handle reservations
    today = timezone.now().date()
    reservations = HotelReservation.objects.filter(
        hotel=instance,
        check_out__gte=today
    )
    
    # Split and process reservations
    pending = reservations.filter(status='pending')
    confirmed = reservations.filter(status='confirmed')
    
    process_pending_hotel_reservations(pending, instance)
    process_confirmed_hotel_reservations(confirmed, instance)

def notify_admins_hotels(hotel):
    """Notify all relevant admins about hotel deletion"""
    admins = Admin.objects.filter(department__in=['owner', 'hotel_manager'])
    for admin in admins:
        Notification.objects.create(
            recipient=admin.user,
            type='Hotel',
            title='Hotel Deleted',
            message=f'The hotel "{hotel.name}" was deleted.',
            priority='high'
        )

def process_pending_hotel_reservations(reservations, hotel):
    """Handle all pending reservations"""
    for reservation in reservations:
        reservation.status = 'cancelled'
        reservation.save()
        Notification.objects.create(
                recipient=reservation.user.user, 
                type='Reservation',
                title='Hotel Reservation Cancelled',
                message=f'Your pending hotel reservation at {hotel.name} (check-in: {reservation.check_in}) has been cancelled because the hotel was removed from our platform.',
                priority='high'
            )
       

def process_confirmed_hotel_reservations(reservations, hotel):

    """Handle all confirmed reservations including refunds"""
    for reservation in reservations:
        print('before : ',reservation.user.balance)
        reservation.user.balance += reservation.total_price
        reservation.user.save()
        print('after : ',reservation.user.balance)

        reservation.status = 'cancelled'
        reservation.save()

        Notification.objects.create(
            recipient=reservation.user.user,
            type='Reservation',
            title='Hotel Reservation Cancelled',
            message=f'Your confirmed Hotel reservation at {hotel.name} (check-in: {reservation.check_in}) has been cancelled.\n your refund {reservation.total_price} has been added to your wallet, contact the staff for more details',
            priority='urgent'  
        )
        


@receiver(pre_delete, sender=Trip)
def handle_trip_deletion(sender, instance, **kwargs):
    # Notify admin
    notify_admins_trips(instance)
    
    # Handle reservations
    today = timezone.now().date()
    reservations = TripReservation.objects.filter(
        trip=instance,
        date__gte = today
    )

    
    

    # Split and process reservations
    pending = reservations.filter(status='pending')
    confirmed = reservations.filter(status='confirmed')
    
    process_pending_trip_reservations(pending, instance)
    process_confirmed_trip_reservations(confirmed, instance)




def notify_admins_trips(trip):
    """Notify all relevant admins about hotel deletion"""
    admins = Admin.objects.filter(department__in=['owner'])
    admins = list(admins) + [trip.created_by]   #norify owner + trip owner

    for admin in admins:
        Notification.objects.create(
            recipient=admin.user,
            type='Trip',
            title='Trip Deleted',
            message=f'The hotel "{trip.title}" was deleted.',
            priority='high'
        )


def process_pending_trip_reservations(reservations, trip):
    for reservation in reservations:
        reservation.status = 'cancelled'
        msg = f'Your pending Trip reservation at {trip.name} (check-in: {reservation.date}) has been cancelled because the Trip was removed from our platform.\n'
        if reservation.hotel_reservaion:
            reservation.hotel_reservaion.status = 'cancelled'
            reservation.hotel_reservaion.save()
            msg += f'the associated hotel reservation at {reservation.hotel_reservation.hotel.name} (check-in: {reservation.check_in}) has been cancelled too'

        reservation.save()

        Notification.objects.create(
                recipient=reservation.user.user, 
                type='Reservation',
                title='Trip Reservation Cancelled',
                message=msg,
                priority='high'
            )
        

def process_confirmed_trip_reservations(reservations, trip):
    """Handle all confirmed reservations including refunds"""
    for reservation in reservations:
        print('before : ',reservation.user.balance)
        added_price = reservation.get_total_price()   #total price including hotel reservation if exists
        reservation.user.balance += added_price
        reservation.user.save()
        print('after : ',reservation.user.balance)

        reservation.status = 'cancelled'
        msg = f'Your pending Trip reservation at {trip.name} (check-in: {reservation.date}) has been cancelled because the Trip was removed from our platform.\n'
        if reservation.hotel_reservaion:
            reservation.hotel_reservaion.status = 'cancelled'
            reservation.hotel_reservaion.save()
            msg += f'the associated hotel reservation at {reservation.hotel_reservation.hotel.name} (check-in: {reservation.check_in}) has been cancelled too.\n'


        reservation.save()

        msg += f'your refund {added_price}$ has been added to your wallet, contact the staff for more details.'
        Notification.objects.create(
            recipient=reservation.user.user,
            type='Reservation',
            title='Trip Reservation Cancelled',
            message=msg,
            priority='urgent'  
        )
        
        