from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.core.exceptions import ValidationError
from main.models import Customer,Trip,Hotel,DepartureTrip


class BaseReservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('over','Over'),
        ('cancelled','cancelled'),
    ]



    user = models.ForeignKey(Customer, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']


    def mark_as_paid(self):
        self.payment_status = 'paid'
        if self.status == 'pending':
            self.status = 'confirmed'
        self.save()


    def simulate_payment(self):
        # Handle TripReservation's linked hotel
        if hasattr(self, 'hotel_reservation') and self.hotel_reservation:
            if self.hotel_reservation.status != 'confirmed':
                self.hotel_reservation.simulate_payment()  # Auto-pay linked hotel

        self.status = 'confirmed'
        self.save()
        return True




class HotelReservation(BaseReservation):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='reservations')
    check_in = models.DateField()
    check_out = models.DateField()
    rooms = models.PositiveBigIntegerField(default=1)
    total_nights = models.PositiveIntegerField(editable=False)
    guests = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    def clean(self):
        # Validate dates
        if self.check_in >= self.check_out:
            raise ValidationError("Check-out date must be after check-in date")
        
        # Validate room availability
        if self.hotel.total_rooms - self.hotel.total_occupied_rooms < self.rooms:
            raise ValidationError(f"Only {self.hotel.total_rooms - self.hotel.total_occupied_rooms} rooms available")

        
      
    def cancel(self):
        self.hotel.total_occupied_rooms -= self.rooms
        self.hotel.save()
        self.status = 'cancelled'
        self.save()
        return True

    def __str__(self):
        return f"Hotel Reservation #{self.id} - {self.hotel.name} ({self.check_in} to {self.check_out})"
    




class TripReservation(BaseReservation):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='reservations')
    departure_trip = models.ForeignKey(DepartureTrip, on_delete=models.SET_NULL, null=True, blank=True)
    tickets = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    hotel_reservation = models.OneToOneField(
        HotelReservation,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,    #if a trip is cancelled without cancelling its hotel reservation
        related_name='trip_reservation'
    )
    date = models.DateTimeField()   


    @property
    def get_total_price(self):
        hotel_price = self.hotel_reservation.total_price if self.hotel_reservation else 0
        return self.total_price + hotel_price

    def clean(self):
        # Validate ticket availability
        available_tickets = self.trip.capacity - self.trip.sold_tickets
        if self.tickets > available_tickets:
            raise ValidationError(f"Only {available_tickets} tickets available for this trip")
        
        
        if self.departure_trip and self.departure_trip.trip != self.trip:
            raise ValidationError("Selected departure doesn't belong to this trip")



    def cancel(self, cancel_hotel=True):
        """Cancel trip reservation and optionally linked hotel reservation"""
        
        # Update ticket availability
        self.trip.sold_tickets = max(0, self.trip.sold_tickets - self.tickets)
        self.trip.save()
        
        if self.departure_trip:
            self.departure_trip.sold_tickets = max(0, self.departure_trip.sold_tickets - self.tickets)
            self.departure_trip.save()
        
        # Handle linked hotel reservation
        if cancel_hotel and self.hotel_reservation:
            self.hotel_reservation.cancel()
        
        
        self.status = 'cancelled'
        self.save()
        return True

    def __str__(self):
        base_str = f"Trip Reservation #{self.id} - {self.trip.title}"
        if self.departure_trip:
            base_str += f" (Departing from {self.departure_trip.location})"
        return base_str