import os
import shutil
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core import validators
from django.core.exceptions import ValidationError
from .trip_categories import TripTypeChoices, ExperienceTypeChoices, PriceTypeChoices, DestinationTypeChoices, TransportTypeChoices
from chat.models import Thread
# ------------------------- Users -------------------------
import uuid
class User(AbstractUser):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)  # Explicitly define username
    phone_number = models.CharField(max_length=15, unique=True)

    is_admin = models.BooleanField(default=False)
    
    #online status fields
    is_online = models.BooleanField(default=False, null=True, blank=True)
    last_seen = models.DateTimeField(null=True, blank=True)

    #objects = 
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
    profile_picture = models.ImageField(upload_to='profile_pictures/customers', default='customer/profile.png')

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
        return f"{self.user.username} - Customer"



# ------------------------- ADMIN MODEL -------------------------
class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='admin')
    first_name = models.CharField(max_length=50,default=" ",null=True,blank=True)
    last_name = models.CharField(max_length=50,default=" ",null=True,blank=True)

    country = models.CharField(max_length=100,default=" ",null=True,blank=True)
    city = models.CharField(max_length=100,default=" ",null=True,blank=True)

    profile_picture = models.ImageField(upload_to='profile_pictures/admins', default='admins/profile.png')

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
        ('marketing', 'Marketing'),
    ]
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)

    class Meta:
        verbose_name = "Admin"
        verbose_name_plural = "Admins"

    

# -------- Hotel ----------
class Hotel(models.Model):
    # Basic Info
    name = models.CharField(max_length=255, unique=True)  # Unique hotel name
    country = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    
    # Contact Info
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    location = models.CharField(max_length=255)  # Address or general location
    star_rating = models.PositiveSmallIntegerField(
        validators=[
            validators.MinValueValidator(1), validators.MaxValueValidator(5)
        ],
        help_text="Rating from 1 to 5 stars",
        default=3,
    )  # Star rating (1-5 stars)
    
    # Room & Pricing
    total_rooms = models.PositiveIntegerField(default=0)  # Total number of rooms
    total_occupied_rooms = models.PositiveBigIntegerField(default=0)
    rooms = models.JSONField(default=dict)  # Room categories & pricing & availability

    # Example structure for room_details JSONField:
    # {
    #     "Single": {"total": 106, "price_per_night": 50,"available:100"},
    #     "Double": {"total": 206, "price_per_night": 80,"available:200"}...
    # }

    def __str__(self):
        return f"{self.name} ({self.star_rating}★)"

'''
 # Amenities
    amenities = models.ManyToManyField('Amenity', blank=True)  # Basic amenities

class Amenity(models.Model):
    AMENITY_CHOICES = [
        ('wifi', 'Free Wi-Fi'),
        ('pool', 'Swimming Pool'),
        ('parking', 'Free Parking'),
        ('gym', 'Gym/Fitness Center'),
        ('restaurant', 'Restaurant On-Site'),
        ('spa', 'Spa & Sauna'),
        ('shuttle', 'Airport Shuttle'),
        ('conference', 'Conference Room'),
        ('laundry', 'Laundry Service'),
    ]

    name = models.CharField(max_length=50, choices=AMENITY_CHOICES, unique=True)  # Each amenity must be unique

    def __str__(self):
        return self.name()

'''

def upload_tp_hotel_images(instance, filename):
    return f'hotels/{instance.hotel.name}/{filename}'

class HotelImages(models.Model):
    hotel = models.ForeignKey(Hotel, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to=upload_tp_hotel_images)
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
    sold_tickets = models.IntegerField(default=0)

   # hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, blank=True, null=True)  # only for packages

    created_by = models.ForeignKey(Admin, on_delete=models.CASCADE,related_name='managed_trips')  # Trip organizer(s) (necssary for permissions)
    guide = models.ForeignKey(Admin, related_name='guiding', on_delete=models.SET_NULL, null=True, blank=True)  # only for group travels
    trip_type = models.CharField(max_length=50, choices=TripTypeChoices.CHOICES, null=True, blank=True)  # package type
    experience = models.CharField(max_length=50, choices=ExperienceTypeChoices.CHOICES)  # adventure/cultural/honeymoon ..ect
    price_category = models.CharField(max_length=50, choices=PriceTypeChoices.CHOICES, null=True, blank=True)  # price category
    destination_type = models.CharField(max_length=50, choices=DestinationTypeChoices.CHOICES, null=True, blank=True)
    transport = models.CharField(max_length=50, choices=TransportTypeChoices.CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[validators.MinValueValidator(0)])
    # activities (to be added later)
    
    country = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    
    discount = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[
            validators.MinValueValidator(0),
            validators.MaxValueValidator(49)
        ],
        blank=True, null=True
    )
    
    departure_date = models.DateTimeField()

    return_date = models.DateTimeField(blank=True, null=True)  # for one way trips
    
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

    
    def delete(self, *args, **kwargs):
        # Construct folder path based on the first image's path (if exists)
        trip_folder = os.path.join(settings.MEDIA_ROOT, "trips_images", self.title)

        # Delete the folder and its contents if it exists
        if os.path.exists(trip_folder):
            shutil.rmtree(trip_folder)

        # Call parent delete method
        super().delete(*args, **kwargs)


def upload_to_trip_images(instance, filename):
    return f'trips_images/{instance.trip.title}/{filename}'

class TripImage(models.Model):
    trip = models.ForeignKey(Trip, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to=upload_to_trip_images)  # call the fct to generate the path dynamically
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.trip.title} (Uploaded at {self.uploaded_at})"

# ---------------------- reservation -------------------#
class Reservation(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Canceled', 'Canceled'),
    ]

    user = models.ForeignKey(Customer, on_delete=models.CASCADE)
    departure_location = models.CharField(max_length=50)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    rooms = models.JSONField(default=dict)  # Example: {"Single": 2, "Suite": 1}
    tickets_number = models.PositiveBigIntegerField(default=1)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[validators.MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)

    

    def __str__(self):
        return f"Reservation by {self.user.user.username} at {self.hotel.name} ({self.status})"

    

# notification
class Notification(models.Model):
    STATUS_CHOICES = [
        ('unread', 'Unread'),
        ('read', 'Read'),
    ]
    
    TYPE_CHOICES = [
        ('reservation_confirmed', 'Reservation Confirmed'),
        ('reservation_rejected', 'Reservation Rejected'),
        ('reservation_canceled', 'Reservation Canceled'),
        ('payment_received', 'Payment Received'),
        ('payment_failed', 'Payment Failed'),
        ('trip_reminder', 'Trip Reminder'),
        ('trip_canceled', 'Trip Canceled'),
        ('trip_rescheduled', 'Trip Rescheduled'),
        ('security_alert', 'Security Alert'),
        ('promo_offer', 'Promo Offer'),
        ('subscription-expired', 'subscription-expired'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unread')

    def mark_as_read(self):
        """Marks the notification as read."""
        self.status = 'read'
        self.save()

    def __str__(self):
        return f"{self.recipient.username} - {self.type} - {self.status}"

class DeletionRequest(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="deletion_request")
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('cancelled', 'Cancelled'),('completed','completed')], default='pending')
    request_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Deletion Request for {self.user.username} - at {self.request_date} - {self.status}"

class ConversationDM(models.Model):
    staff = models.ForeignKey(Admin, on_delete=models.PROTECT)
    cust = models.ForeignKey(Customer, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # updated with each sent message
    last_message = models.ForeignKey('MessageDM', on_delete=models.SET_NULL, blank=True, null=True)

    class Meta:
        ordering = ['-updated_at']
        constraints = [
            models.UniqueConstraint(
                fields=['staff', 'cust'],
                name='conversation'
            ),
        ]

class MessageDM(models.Model):
    conversation = models.ForeignKey(ConversationDM, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(User, on_delete=models.PROTECT,related_name='chat_sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.PROTECT,related_name='chat_received_messages')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['sent_at']

    def save(self,*args,**kwargs):
        if not (self.sender in [self.conversation.staff.user, self.conversation.cust.user] and 
                self.receiver in [self.conversation.staff.user, self.conversation.cust.user]):
            raise ValueError("Sender and receiver must be part of the conversation.")
        
        super().save(*args,**kwargs)
        self.conversation.last_message = self
        self.conversation.save()

class GroupChatConversation(models.Model):
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='chat_group_chat')  # One group chat per trip
    participants = models.ManyToManyField(User, related_name='chat_group_chats')  # Customers and admins in the chat
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Updated with each message

    class Meta:
        verbose_name = "Group Chat Conversation"
        verbose_name_plural = "Group Chat Conversations"
        ordering = ['-updated_at']

    def __str__(self):
        return f"Group Chat for {self.trip.title}"

class MessageGroup(models.Model):
    conversation = models.ForeignKey(GroupChatConversation, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_group_messages_sent')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Group Chat Message"
        verbose_name_plural = "Group Chat Messages"
        ordering = ['sent_at']

    def __str__(self):
        return f"Message by {self.sender.username} in {self.conversation.trip.title}"


class ChatbotConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatbot_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Updated with each message

    class Meta:
        verbose_name = "Chatbot Conversation"
        verbose_name_plural = "Chatbot Conversations"
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chatbot Conversation with {self.user.username}"

class MessageBot(models.Model):
    conversation = models.ForeignKey(ChatbotConversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=[('user', 'User'), ('bot', 'Bot')])  # Track who sent the message
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Chatbot Message"
        verbose_name_plural = "Chatbot Messages"
        ordering = ['sent_at']

    def __str__(self):
        return f"Message by {self.sender} in Chatbot Conversation {self.conversation.id}"