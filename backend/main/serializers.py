from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Customer,Admin,Trip,TripImage, MessageDM, ConversationDM, GroupChatConversation, MessageGroup, SupportTicket
from .trip_categories import TripTypeChoices
from rest_framework.exceptions import ValidationError

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'password']

    def validate(self, data):
        email = data.get("email")
        username = data.get("username")
        phone_number = data.get("phone_number")
        password = data.get('password')

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})

        if User.objects.filter(phone_number=phone_number).exists():
            raise serializers.ValidationError({"phone_number": "This phone number is already registered."})

        def is_strong_password(password):
            if (
                len(password) < 8 or
                not any(char.islower() for char in password) or
                not any(char.isupper() for char in password)
            ):
                return False
            return True

        if not is_strong_password(password):
            raise serializers.ValidationError({'password': 'The password you have provided is too weak.'})

        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for key, value in validated_data.items():
            setattr(instance, key, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Customer
        fields = [
            'user', 'first_name', 'last_name', 'country', 'city', 'birthdate',
            'profile_picture', 'gender', 'favorite_currency'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_ser = UserSerializer(data=user_data)

        if user_ser.is_valid():
            user = user_ser.save()
            customer = Customer.objects.create(user=user, **validated_data)
            return customer
        else:
            raise serializers.ValidationError(user_ser.errors)

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        user = instance.user

        # Update the User instance
        if user_data:
            user_ser = UserSerializer(user, data=user_data, partial=True)
            if user_ser.is_valid():
                user_ser.save()
            else:
                raise serializers.ValidationError(user_ser.errors)

        # Update the Customer instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance



class AdminSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Admin
        fields = [
            'user', 'first_name', 'last_name', 'country', 'city', 'years_of_experience',
            'profile_picture', 'gender', 'join_date', 'department'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_ser = UserSerializer(data=user_data)

        if user_ser.is_valid():
            user = user_ser.save()
            setattr(user, 'is_admin', True)
            admin = Admin.objects.create(user=user, **validated_data)
            return admin
        else:
            raise serializers.ValidationError(user_ser.errors)

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        user = instance.user

        # Update the User instance
        if user_data:
            user_ser = UserSerializer(user, data=user_data, partial=True)
            if user_ser.is_valid():
                user_ser.save()
            else:
                raise serializers.ValidationError(user_ser.errors)

        # Update the Admin instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    

class TripImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripImage
        fields = ['id','image']


class TripSerializer(serializers.ModelSerializer):
    sold_tickets = serializers.IntegerField(write_only=True)

    images = TripImageSerializer(many=True, read_only=True)  #GET
    uploaded_images = serializers.ListField( #POST
        child=serializers.ImageField(), write_only=True, required=False
    )  

    deleted_images = serializers.ListField(  # For deleting images during update
        child=serializers.IntegerField(), write_only=True, required=False
    )
    class Meta:
        model = Trip
        fields = [
            'title', 'description', 'capacity', 'sold_tickets',
            'guide', 'trip_type', 'experience', 'price_category',
            'destination_type', 'transport', 'price',
            'country', 'city', 'discount', 'created_by',  # Fixed: Added comma here
            'departure_date', 'return_date', 'is_one_way',
            'images','uploaded_images','deleted_images'
        ]

    def validate(self, validated_data):
        trip_type = validated_data.get('trip_type', None)
        guide = validated_data.get('guide', None)


        if trip_type == 'group' and not guide:
            raise ValidationError('ERROR: group trips must have a guide')
        elif not trip_type =='group' and guide:
            raise ValidationError('ERROR: only group trips can have a guide')

        departure_date = validated_data.get('departure_date', None)
        return_date = validated_data.get('return_date', None)

        if departure_date and return_date and departure_date > return_date:
            raise ValidationError('ERROR: return date cannot be before departure date')

        return validated_data
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images",[])
        trip = Trip.objects.create(**validated_data)

        for image in uploaded_images:
            TripImage.objects.create(trip=trip,image=image)

        return trip
        

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        deleted_images = validated_data.pop('deleted_images', [])


        instance = super().update(instance, validated_data)


        for image in uploaded_images:
            TripImage.objects.create(trip=instance, image=image)
    
            

        # Delete specified images
        TripImage.objects.filter(id__in=deleted_images, trip=instance).delete()

        return instance
    
    """ CONVERSATION AND MESSAGES SERIALIZERS """
User = get_user_model()

class MessagesDMSeriliazer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    receiver = serializers.StringRelatedField()

    class Meta :
        model = MessageDM
        fields = [
            "id", "conversation", "sender", "receiver", 
            "content", "sent_at", "is_read"
        ]
        read_only_fields = ["sent_at","is_read"]

class ConversationDMSerializer(serializers.ModelSerializer):
    staff = serializers.StringRelatedField(source="staff.user")
    cust = serializers.StringRelatedField(source="cust.user")
    last_message = MessagesDMSeriliazer(read_only=True)

    class Meta:
       model = ConversationDM
       fields = ["id", "staff", "cust", 
                 "created_at", "updated_at", 
                 "last_message"]

class MessageGroupSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sent_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = MessageGroup
        fields = ['id', 'conversation', 'sender', 'sender_username', 'content', 'sent_at']
        read_only_fields = ['id', 'sender', 'sent_at']

class GroupChatConversationSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)
    messages = MessageGroupSerializer(many=True, source='chat_messages', read_only=True)

    class Meta:
        model = GroupChatConversation
        fields = ['id', 'trip', 'participants', 'created_at', 'updated_at', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at']



class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields=['id', 'subject', 'description', 'status', 'created_at', 'accepted_by']
        read_only_fields = ['status', 'created_at', 'accepted_by']