from django.db.models.signals import pre_delete,post_delete
from django.dispatch import receiver
from django.utils import timezone
from main.models import Hotel,Trip,DepartureTrip
from reservation.models import HotelReservation,TripReservation
from main.models import Notification
from main.models import Admin
import threading


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
        


local = threading.local()

@receiver(pre_delete, sender=Trip)
def handle_trip_deletion(sender, instance, **kwargs):
    # Notify admin
    notify_admins_trips(instance)
    local.skip_signal = True
    # Handle reservations
    reservations = TripReservation.objects.filter(
        trip=instance,
    )


    # Split and process reservations
    pending = reservations.filter(status='pending')
    confirmed = reservations.filter(status='confirmed')


    process_pending_trip_reservations(pending, instance)
    process_confirmed_trip_reservations(confirmed, instance)


@receiver(post_delete,sender=Trip)
def after_trip_deletion(sender,instance,**kwargs):
    local.skip_signal = False


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
        msg = f'Your pending Trip reservation at {trip.title} (check-in: {reservation.date}) has been cancelled because the Trip was removed from our platform.\n'
        if reservation.hotel_reservation:
            reservation.hotel_reservation.status = 'cancelled'
            reservation.hotel_reservation.save()
            msg += f'the associated hotel reservation at {reservation.hotel_reservation.hotel.name} (check-in: {reservation.hotel_reservation.check_in}) has been cancelled too'

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
        added_price = reservation.get_total_price  #total price including hotel reservation if exists
        reservation.user.balance += added_price
        reservation.user.save()



        reservation.status = 'cancelled'
        msg = f'Your pending Trip reservation at {trip.title} (check-in: {reservation.date}) has been cancelled because the Trip was removed from our platform.\n'
        if reservation.hotel_reservation:
            reservation.hotel_reservation.status = 'cancelled'
            reservation.hotel_reservation.save()
            msg += f'the associated hotel reservation at {reservation.hotel_reservation.hotel.name} (check-in: {reservation.hotel_reservation.check_in}) has been cancelled too.\n'


        reservation.save()

        msg += f'your refund {added_price}$ has been added to your wallet, contact the staff for more details.'
        Notification.objects.create(
            recipient=reservation.user.user,
            type='Reservation',
            title='Trip Reservation Cancelled',
            message=msg,
            priority='urgent'  
        )
        
        



@receiver(pre_delete, sender=DepartureTrip)
def handle_departure_trip_deletion(sender, instance, **kwargs):
    if getattr(local,'skip_signal',False) == False:
        print('skipping successful')
        return
    
    # Notify admin
    notify_admins_departure_trip(instance)
    
    # Handle reservations
    reservations = TripReservation.objects.filter(
        departure_trip=instance,
        trip = instance.trip,
    )

    print("Found trip reservations:", reservations.count())
    print(reservations)


    # Split and process reservations
    pending = reservations.filter(status='pending')
    confirmed = reservations.filter(status='confirmed')

    print('pending : ',pending.count())


    print('confirmed : ',confirmed.count())    
    process_pending_departure_reservations(pending, instance)
    process_confirmed_departure_reservations(confirmed, instance)






def notify_admins_departure_trip(departure_trip):
    """Notify all relevant admins about departure trip deletion"""
    admins = Admin.objects.filter(department__in=['owner'])
    admins = list(admins) + [departure_trip.trip.created_by]  # notify owner + trip owner

    for admin in admins:
        Notification.objects.create(
            recipient=admin.user,
            type='DepartureTrip',
            title='Departure Location Deleted',
            message=f'The departure location "{departure_trip.location}" for trip "{departure_trip.trip.title}" was deleted.',
            priority='high'
        )

def process_pending_departure_reservations(reservations, departure_trip):
    """Handle all pending reservations for the deleted departure trip"""
    for reservation in reservations:
        reservation.status = 'cancelled'
        msg = f'Your pending departure reservation for {departure_trip.trip.title} from {departure_trip.location} has been cancelled because the departure location was removed.\n'
        
        if reservation.hotel_reservation:
            reservation.hotel_reservation.status = 'cancelled'
            reservation.hotel_reservation.save()
            msg += f'The associated hotel reservation at {reservation.hotel_reservation.hotel.name} (check-in: {reservation.hotel_reservation.check_in}) has been cancelled too.'

        reservation.save()

        Notification.objects.create(
            recipient=reservation.user.user,
            type='Reservation',
            title='Departure Reservation Cancelled',
            message=msg,
            priority='high'
        )


def process_confirmed_departure_reservations(reservations, departure_trip):
    """Handle all confirmed departure trip reservations including refunds"""
    for reservation in reservations:
        # Refund the departure trip price
        added_price = reservation.get_total_price  #total price including hotel reservation if exists
        reservation.user.balance += added_price
        reservation.user.save()



        reservation.status = 'cancelled'
        msg = f'Your confirmed departure reservation for {departure_trip.trip.title} from {departure_trip.location} has been cancelled because the departure location was removed.\n'
        
        if reservation.hotel_reservation:
            reservation.hotel_reservation.status = 'cancelled'
            reservation.hotel_reservation.save()
            msg += f'The associated hotel reservation at {reservation.hotel_reservation.hotel.name} (check-in: {reservation.hotel_reservation.check_in}) has been cancelled too.\n'

        reservation.save()

        msg += f'Your refund of {added_price}$ has been added to your wallet. Contact staff for more details.'
        Notification.objects.create(
            recipient=reservation.user.user,
            type='Reservation',
            title='Departure Reservation Cancelled',
            message=msg,
            priority='urgent'
        )