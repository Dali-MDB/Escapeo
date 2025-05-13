import os
import shutil
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core import validators
from django.core.exceptions import ValidationError
from decimal import Decimal
from .trip_categories import TripTypeChoices, ExperienceTypeChoices, PriceTypeChoices, DestinationTypeChoices, TransportTypeChoices
from .managers import UserManager

# ------------------------- Users -------------------------
import uuid
class User(AbstractUser):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)  # Explicitly define username
    phone_number = models.CharField(max_length=15, unique=True)
    is_admin = models.BooleanField(default=False)
   
    is_online = models.BooleanField(default=False)


    objects = UserManager()
    USERNAME_FIELD = "email"  # Authenticate using email
    REQUIRED_FIELDS = ["username", "phone_number"]  # Only these are required when creating a user

    def __str__(self):
        return f'{self.username}-{self.email}'




    
class Customer(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='customer')
   
    first_name = models.CharField(max_length=50,default=" ",null=True,blank=True)
    last_name = models.CharField(max_length=50,default=" ",null=True,blank=True)

    country = models.CharField(max_length=100,default=" ",null=True,blank=True)
    city = models.CharField(max_length=100,default=" ",null=True,blank=True)

    birthdate = models.DateField(null=True,blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/customers', default='profile_pictures/profile.png')


    loyalty_points = models.PositiveIntegerField(default=0, validators=[validators.MaxValueValidator(500)])
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Wallet Balance

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unknown','Unknown'),
    ]
    gender = models.CharField(max_length=7, choices=GENDER_CHOICES,default="Unknown")

    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
        ('CAD', 'Canadian Dollar'),
        ('DZD', 'Algerian Dinar'),
    ]
    favorite_currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default='USD')

    purchased_trips = models.ManyToManyField('Trip', related_name="purchasers", blank=True)
    favorite_trips = models.ManyToManyField('Trip', related_name="favorited_by", blank=True)

    class Meta:
        verbose_name = "Customer"
        verbose_name_plural = "Customers"

    def __str__(self):
        return f"{self.user} -Customer"



# ------------------------- ADMIN MODEL -------------------------
class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='admin')
    first_name = models.CharField(max_length=50,default=" ",null=True,blank=True)
    last_name = models.CharField(max_length=50,default=" ",null=True,blank=True)

    country = models.CharField(max_length=100,default=" ",null=True,blank=True)
    city = models.CharField(max_length=100,default=" ",null=True,blank=True)

    profile_picture = models.ImageField(upload_to='profile_pictures/admins', default='profile_pictures/profile.png')

    years_of_experience = models.PositiveIntegerField(default=0)
    join_date = models.DateField(auto_now_add=True)

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unknown','Unknown'),
    ]
    gender = models.CharField(max_length=7, choices=GENDER_CHOICES,default="Unknown")

    DEPARTMENT_CHOICES = [
        ('owner', 'Owner'),
        ('staff', 'Staff'),
        ('tour_guide', 'Tour Guide'),
        ('customer_support', 'Customer Support'),
        ('hotel_manager', 'Hotel Manager'),
    ]
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)

    class Meta:
        verbose_name = "Admin"
        verbose_name_plural = "Admins"

    def __str__(self):
        return f'{self.user} -Admin'

    

class Hotel(models.Model):
    # Basic Info
    name = models.CharField(max_length=255, unique=True)  # Unique hotel name
    location = models.CharField(max_length=100)  # Combined country and city
    
    # Contact Info
    phone = models.CharField(max_length=20)
    email = models.EmailField(null=True,blank=True)
    

    # Location & Ratings
    address = models.CharField(max_length=255)  # Address or general location
    stars_rating = models.PositiveSmallIntegerField(
        validators=[validators.MinValueValidator(1), validators.MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars",
        default=3,
    )
    
    # Room & Pricing
    total_rooms = models.PositiveIntegerField(default=0)
    total_occupied_rooms = models.PositiveIntegerField(default=0)
    price_per_night = models.DecimalField(max_digits=6,decimal_places=2,default=60.99)
    amenities = models.CharField(max_length=200,blank=True, null=True)  # Stores a list of amenities
    
    
    class Meta:
        verbose_name = "Hotel"
        verbose_name_plural = "Hotels"
    
    def clean(self):
        if self.total_occupied_rooms > self.total_rooms:
            raise ValidationError({
                'total_occupied_rooms': "The number of occupied rooms cannot exceed the total number of rooms."
            })
    
    def delete(self, *args, **kwargs):
        hotel_folder = os.path.join(settings.MEDIA_ROOT, "hotels", self.name)
        if os.path.exists(hotel_folder) and os.path.isdir(hotel_folder):
            shutil.rmtree(hotel_folder)
        super().delete(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} ({self.stars_rating}★)"


def upload_to_hotel_images(instance, filename):
    return f'hotels/{instance.hotel.name}/{filename}'

class HotelImages(models.Model):
    hotel = models.ForeignKey(Hotel, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to=upload_to_hotel_images)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    
    
    def __str__(self):
        return f"Image for {self.hotel.name} (uploaded at {self.uploaded_at})"
    
    

# -----------Trip-----------
class Trip(models.Model):
    title = models.CharField(max_length=200,unique=True)
    description = models.TextField(null=True,blank=True)
    capacity = models.IntegerField(
        validators=[validators.MinValueValidator(1.0)],
        help_text="Number of people this trip can accommodate."
    )  # how many ppl it can take
    sold_tickets = models.IntegerField(default=0, db_default=0)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, blank=True, null=True) 
    created_by = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='managed_trips')
    guide = models.ForeignKey(Admin, related_name='guiding', on_delete=models.SET_NULL, null=True, blank=True)  # only for group travels
    trip_type = models.CharField(max_length=50, choices=TripTypeChoices.CHOICES, null=True, blank=True)  # package type
    experience = models.CharField(max_length=50, choices=ExperienceTypeChoices.CHOICES)
    price_category = models.CharField(max_length=50, choices=PriceTypeChoices.CHOICES, null=True, blank=True)
    destination = models.CharField(max_length=100)
    destination_type = models.CharField(max_length=50, choices=DestinationTypeChoices.CHOICES, null=True, blank=True)
    transport = models.CharField(max_length=50, choices=TransportTypeChoices.CHOICES)
    discount = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[validators.MinValueValidator(Decimal('0.0')), validators.MaxValueValidator(Decimal('49.0'))],
        blank=True, null=True
    )
    stars_rating = models.FloatField(
        validators=[validators.MinValueValidator(Decimal('1.0')), validators.MaxValueValidator(Decimal('5.0'))],
        help_text="Rating from 1 to 5 stars",
        db_default=3,
    )


    STATUS_CHOICES =[
        ('coming','Coming Soon'),
        ('ongoing','Ongoing'),
        ('done','Completed'),
    ]

    status = models.CharField(max_length=10,default='coming')


    departure_date = models.DateTimeField()
    return_date = models.DateTimeField(blank=True, null=True)
    is_one_way = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.title} ({self.trip_type}, {self.departure_date})"

    class Meta:
        verbose_name = "Trip"
        verbose_name_plural = "Trips"

        constraints = [
            models.UniqueConstraint(
                fields=['title', 'created_by'],
                name='unique_trip_signature'
            ),
        ]

    def clean(self):
        if self.return_date and self.departure_date >= self.return_date:
            raise ValidationError("Return date cannot be before the departure date.")
        if self.trip_type == 'group' and not self.guide:  # if it's a group trip there must be a guide
            raise ValidationError("A guide must be assigned for group trips.")



    
    def save(self, *args, **kwargs):
        from Chat.models import GroupConversation

        created = not self.pk  # Check if this is a new instance
        super().save(*args, **kwargs)

        # Ensure GroupConversation is created for group trips
        if self.trip_type == 'group':
            GroupConversation.objects.get_or_create(trip=self)
    
    def delete(self, *args, **kwargs):
        # Construct folder path based on the first image's path (if exists)
        trip_folder = os.path.join(settings.MEDIA_ROOT, "trips_images", self.title)

        # Delete the folder and its contents if it exists
        if os.path.exists(trip_folder):
            shutil.rmtree(trip_folder)

        # Call parent delete method
        super().delete(*args, **kwargs)

    @property
    def group_chat_exists(self):
        """Check if a group conversation exists for this trip."""
        return hasattr(self, 'group_conversation') and self.group_conversation is not None

    def get_group_chat_participants(self):

        participants = list(self.purchasers.all().values_list('user', flat=True))
        if self.guide:
            participants.append(self.guide.user.id)
        return User.objects.filter(id__in=participants)

    def user_has_chat_access(self, user):
       
        if hasattr(user, 'customer'):
            return self.purchasers.filter(id=user.customer.id).exists()
        if hasattr(user, 'admin') and self.guide:
            return user.admin.id == self.guide.id
        return False


class DepartureTrip(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='departure_places')
    location = models.CharField(max_length=100)
    capacity = models.IntegerField(validators=[validators.MinValueValidator(1)])
    sold_tickets = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[validators.MinValueValidator(Decimal('0'))])
    
    def __str__(self):
        return f"{self.trip.title} - {self.location}"


def upload_to_trip_images(instance, filename):
    return f'trips_images/{instance.trip.title}/{filename}'

class TripImage(models.Model):
    trip = models.ForeignKey(Trip, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to=upload_to_trip_images)  # call the fct to generate the path dynamically
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.trip.title} (Uploaded at {self.uploaded_at})"


# notification
class Notification(models.Model):
    STATUS_CHOICES = [
        ('unread', 'Unread'),
        ('read', 'Read'),
    ]
    
    TYPE_CHOICES = [
        ('Reservation' , 'Reservation'),
        ('Payment' , 'Payment'),
        ('Trip' , 'Trip'),
        ('Security' , 'Security'),
        ('Hotel','Hotel'),
    ]

    PRIORITY_CHOICES = [
        ('urgent','urgent'),
        ('high','High'),
        ('medium','Medium'),
        ('low','Low'),
    ]
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=50)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unread')
    priority = models.CharField(max_length=6,choices=PRIORITY_CHOICES,default='medium')


    def mark_as_read(self):
        """Marks the notification as read."""
        self.status = 'read'
        self.save()

    def __str__(self):
        return f"{self.recipient.username} - {self.type} - {self.status}"
