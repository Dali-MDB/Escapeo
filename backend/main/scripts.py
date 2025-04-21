from django.utils import timezone

def update_trip_status(trip):
    """
    Updates the status of a trip based on the current time.
    """
    if trip.status in ['cancelled','draft']:
        return

    now = timezone.now()
    
    # Check if the trip is ongoing
    if trip.departure_date <= now < (trip.return_date or now):
        trip.status = 'ongoing'
    # Check if the trip is completed
    elif trip.return_date and now >= trip.return_date:
        trip.status = 'completed'
    
    # Save the trip if the status has changed
    if trip.tracker.has_changed('status'):
        trip.save()

    return trip  # Return the updated trip