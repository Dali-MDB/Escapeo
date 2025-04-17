from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from reservation.models import HotelReservation, TripReservation
from main.models import Notification, Admin

User = get_user_model()

def create_notification(recipient, notification_type, title, message):
    """
    Helper function to create notifications
    """
    return Notification.objects.create(
        recipient=recipient,
        type=notification_type,
        title=title,
        message=message,
    )

def notify_admins(admins, notification_type, title, message):
    """
    Helper function to notify a list of admins
    """
    for admin in admins:
        create_notification(
            recipient=admin.user if hasattr(admin, 'user') else admin,
            notification_type=notification_type,
            title=title,
            message=message
        )

def get_trip_date_info(trip):
    """
    Format date information based on trip type
    """
    if trip.is_one_way:
        return f"on {trip.departure_date}"
    else:
        return f"from {trip.departure_date} to {trip.return_date}"

def get_hotel_date_info(hotel_reservation):
    """
    Format hotel reservation date information
    """
    return f"check-in: {hotel_reservation.check_in} - check-out: {hotel_reservation.check_out}"

def get_relevant_admins(departments=None, additional_admins=None):
    """
    Get admins based on departments and add any additional admins
    """
    admins = Admin.objects.filter(department__in=departments or ['owner'])
    if additional_admins:
        admins = list(admins) + (additional_admins if isinstance(additional_admins, list) else [additional_admins])
    return admins

@receiver(post_save, sender=HotelReservation)
def send_hotel_reservation_notifications(sender, instance, created, **kwargs):
    """
    Send notifications when a new HotelReservation is created
    """
    if created:  # Only trigger for new reservations, not updates
        handle_hotel_notification(instance, paid=False)

@receiver(post_save, sender=TripReservation)
def send_trip_reservation_notifications(sender, instance, created, **kwargs):
    """
    Send notifications when a new TripReservation is created
    """
    if created:
        handle_trip_notification(instance, paid=False)

def handle_hotel_notification(instance, paid=False):
    """
    Handle notifications for hotel reservations (new or paid)
    """
    request_user = instance.user.user
    hotel_info = f"hotel {instance.hotel.name} ({get_hotel_date_info(instance)})"
    notification_type = 'Payment' if paid else 'Reservation'
    
    # User notification
    if paid:
        user_title = 'Hotel reservation payment successful'
        user_msg = f'You have successfully paid for your reservation at {hotel_info}.\nEnjoy your stay.'
    else:
        user_title = 'Hotel reservation was made successfully'
        user_msg = f'You have successfully made a reservation for the {hotel_info}.\nPlease consult the reservation page to view payment details.'
    
    create_notification(
        recipient=request_user,
        notification_type=notification_type,
        title=user_title,
        message=user_msg
    )
    
    # Admin notifications
    if not paid:
        
        admin_title = 'A user had made a Hotel Reservation'
        admin_msg = f'User {request_user.customer} has made a reservation for the {hotel_info}.\nPlease verify payment within 48 hours, or the reservation will be auto-deleted.'
        admins = get_relevant_admins(departments=['owner', 'hotel_manager'])
        notify_admins(admins, notification_type, admin_title, admin_msg)

def handle_trip_notification(instance, paid=False):
    """
    Handle notifications for trip reservations (new or paid)
    """
    request_user = instance.user.user
    date_info = get_trip_date_info(instance.trip)
    trip_info = f'trip "{instance.trip.title}" ({date_info})'
    notification_type = 'Payment' if paid else 'Reservation'
    
    # User notification
    action = 'paid for your' if paid else 'reserved the'
    message = f'You have successfully {action} {trip_info}.\n'
    
    # Add hotel reservation info if exists
    if getattr(instance, 'hotel_reservation', None):
        hotel = instance.hotel_reservation.hotel
        hotel_dates = get_hotel_date_info(instance.hotel_reservation)
        message += f'\nThis includes a hotel reservation at "{hotel.name}" ({hotel_dates}).\n'
    
    if not paid:
        message += 'Please check the reservation page for payment details.'
    
    create_notification(
        recipient=request_user,
        notification_type=notification_type,
        title='Trip reservation was made successfully',
        message=message
    )
    
    # Admin notifications
    
    
    if not paid:
        admin_action = 'paid for his' if paid else 'reserved the'
        admin_msg = f'User {request_user.customer} has {admin_action} {trip_info}.\n'
        admin_msg += 'Please verify the payment proof within 48 hours.'
    
        admins = get_relevant_admins(departments=['owner'], additional_admins=instance.trip.created_by)
        notify_admins(admins, notification_type, 'A user had made a Trip Reservation successfully.', admin_msg)

def notify_failed_trip_payment(instance):
    """
    Notify user about failed trip payment
    """
    request_user = instance.user.user
    date_info = get_trip_date_info(instance.trip)
    
    message = (
        f'Your payment for the trip reservation: "{instance.trip.title}" '
        f'({date_info}) has failed. Please review your payment method '
        f'or contact staff if you believe there has been a mistake.'
    )
    
    create_notification(
        recipient=request_user,
        notification_type='Payment',
        title='Failed trip reservation payment',
        message=message
    )


def handle_cancelled_hotel_reservation(reservation: HotelReservation, paid: bool):
    """
    Handle notifications for cancelled hotel reservations
    """
    user = reservation.user.user
    hotel_info = f"hotel {reservation.hotel.name} ({get_hotel_date_info(reservation)})"
    
    message = f'Your hotel reservation at {hotel_info} has been cancelled successfully.\n'
    if paid:
        message += f'We have added the refund (${reservation.total_price}) to your wallet. You may use it for your next trip, or you may contact staff to transfer it to your bank account.'
    
    create_notification(
        recipient=user,
        notification_type='Reservation',
        title='Hotel Reservation cancelled successfully',
        message=message
    )
    
   


def handle_cancelled_trip_reservation(reservation: TripReservation, paid: bool, trip_refund=0, hotel_refund=0, total_refund=0):
    """
    Handle notifications for cancelled trip reservations
    
    Args:
        reservation: The TripReservation being cancelled
        paid: Whether the reservation was paid for
        trip_refund: Amount refunded for the trip portion
        hotel_refund: Amount refunded for the hotel portion
        total_refund: Total refund amount (trip + hotel)
    """
    user = reservation.user.user
    date_info = get_trip_date_info(reservation.trip)
    trip_info = f'trip "{reservation.trip.title}" ({date_info})'
    
    message = f'Your {trip_info} has been cancelled successfully.\n'
    
    # Check if there is a hotel_reservation
    if reservation.hotel_reservation:
        hotel = reservation.hotel_reservation.hotel
        hotel_info = get_hotel_date_info(reservation.hotel_reservation)
        message += f'This included a hotel reservation at "{hotel.name}" ({hotel_info}) which has also been cancelled.\n'
    
    if paid:
        if reservation.hotel_reservation and hotel_refund > 0:
            message += f'We have added the refund to your wallet (Trip: ${trip_refund}, Hotel: ${hotel_refund}, Total: ${total_refund}). '
        else:
            message += f'We have added the refund (${trip_refund}) to your wallet. '
        
        message += 'You may use it for your next trip, or you may contact staff to transfer it to your bank account.'
    
    create_notification(
        recipient=user,
        notification_type='Reservation',
        title='Trip Reservation cancelled successfully',
        message=message
    )
    