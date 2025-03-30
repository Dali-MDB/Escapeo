from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.conf import settings
from django.core.exceptions import ValidationError
from main.models import Customer,Trip,Hotel,DepartureTrip


class BaseReservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    user = models.ForeignKey(Customer, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def apply_discount(self):
        if self.discount:
            self.total_price -= self.total_price * (self.discount / Decimal('100.0'))
        return self.total_price

    def mark_as_paid(self):
        self.payment_status = 'paid'
        if self.status == 'pending':
            self.status = 'confirmed'
        self.save()




class HotelReservation(BaseReservation):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='reservations')
    check_in = models.DateField()
    check_out = models.DateField()
    room_details = models.JSONField()  # Format: {"RoomType": {"quantity": 1, "price_per_night": 100}}
    total_nights = models.PositiveIntegerField(editable=False)
    guests = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    def clean(self):
        # Validate dates
        if self.check_in >= self.check_out:
            raise ValidationError("Check-out date must be after check-in date")
        
        # Validate room details
        if not self.room_details:
            raise ValidationError("At least one room must be selected")
        
        available_rooms = self.hotel.rooms
        for room_type, details in self.room_details.items():
            if room_type not in available_rooms:
                raise ValidationError(f"Room type '{room_type}' not available at this hotel")
            
            quantity = details.get('quantity', 0)
            if quantity <= 0:
                raise ValidationError(f"Quantity for '{room_type}' must be at least 1")
            
            available = available_rooms[room_type].get('available', 0)
            if quantity > available:
                raise ValidationError(f"Only {available} '{room_type}' rooms available")

    def save(self, *args, **kwargs):
        self.total_nights = (self.check_out - self.check_in).days
        
        # Calculate total price
        self.total_price = Decimal('0')
        for room_type, details in self.room_details.items():
            self.total_price += Decimal(details['quantity']) * Decimal(details['price_per_night']) * self.total_nights
        
        self.apply_discount()
        super().save(*args, **kwargs)

    def cancel(self):
        """Cancel reservation and update room availability"""
        if self.status == 'cancelled':
            return
        
        # Restore room availability
        hotel = self.hotel
        rooms = hotel.rooms.copy()  # Create a copy to modify
        
        for room_type, details in self.room_details.items():
            if room_type in rooms:
                rooms[room_type]['available'] = rooms[room_type].get('available', 0) + details['quantity']
        
        hotel.rooms = rooms
        hotel.save()
        
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
        on_delete=models.SET_NULL,
        related_name='trip_reservation'
    )

    def clean(self):
        # Validate ticket availability
        available_tickets = self.trip.capacity - self.trip.sold_tickets
        if self.tickets > available_tickets:
            raise ValidationError(f"Only {available_tickets} tickets available for this trip")
        
        # Validate departure location if required
        if self.trip.trip_type == 'group' and not self.departure_trip:
            raise ValidationError("Departure location is required for group trips")
        
        if self.departure_trip and self.departure_trip.trip != self.trip:
            raise ValidationError("Selected departure doesn't belong to this trip")

    def save(self, *args, **kwargs):
        # Calculate base price
        if self.departure_trip:
            self.total_price = self.tickets * self.departure_trip.price
        else:
            self.total_price = self.tickets * Decimal(str(self.trip.price_category))
        
        # Add hotel price if included
        if self.hotel_reservation:
            self.total_price += self.hotel_reservation.total_price
        
        self.apply_discount()
        super().save(*args, **kwargs)

    def cancel(self, cancel_hotel=True):
        """Cancel trip reservation and optionally linked hotel reservation"""
        if self.status == 'cancelled':
            return False
        
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