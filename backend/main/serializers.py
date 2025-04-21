'''from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Customer,Trip,TripImage
from .trip_categories import TripTypeChoices
from rest_framework.exceptions import ValidationError
from .models import Hotel , HotelImages 

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



class AdminSerializer(serializers.Serializer):
    pass


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
    



class HotelImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = HotelImages
        fields = ['id', 'image']

class HotelSerializer(serializers.ModelSerializer):
    images = HotelImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField( #POST
        child=serializers.ImageField(), write_only=True, required=False
    )  

    deleted_images = serializers.ListField(  
        child=serializers.IntegerField(), write_only=True, required=False
    )
    
    class Meta:
        model = Hotel
        fields = ['name', 'country', 'city', 'phone', 'email', 'location', 'star_rating', 'total_rooms',
         'total_occupied_rooms', 'rooms', 'images', 'created_by'
         ,'uploaded_images','deleted_images']

    def validate(self, validated_data):
        name = validated_data.get("name", "").strip()
        created_by = validated_data.get("created_by")
        total_rooms = validated_data.get("total_rooms", 0)
        total_occupied_rooms = validated_data.get("total_occupied_rooms", 0)
        star_rating = validated_data.get("star_rating", 3)
        rooms = validated_data.get("rooms", {}) or {}

        # Vérifier si un hôtel avec le même nom et le même admin existe déjà
        if Hotel.objects.filter(name=name, created_by=created_by).exists():
            raise ValidationError("ERROR: This administrator already has a hotel with this name.")

    
        if total_rooms < 0:
            raise ValidationError("ERROR: Total rooms cannot be negative.")

        if total_occupied_rooms > total_rooms:
            raise ValidationError("ERROR: The number of occupied rooms cannot exceed the total rooms.")

        if not (1 <= star_rating <= 5):
            raise ValidationError("ERROR: Star rating must be between 1 and 5.")

        # Vérification des chambres et leurs disponibilités
        for category, details in rooms.items():
            if not isinstance(details, dict) or "price" not in details or "availability" not in details:
                raise ValidationError(f"ERROR: Room category '{category}' must have 'price' and 'availability'.")

            if details["price"] < 0:
                raise ValidationError(f"ERROR: Room price for '{category}' cannot be negative.")

            if details["availability"] < 0:
                raise ValidationError(f"ERROR: Room availability for '{category}' cannot be negative.")

        return validated_data
    

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])  # Récupérer les images envoyées
        created_by = validated_data.get("created_by")
        name = validated_data.get("name")

        # Vérifier si un hôtel avec le même nom et le même administrateur existe déjà
        if Hotel.objects.filter(name=name, created_by=created_by).exists():
            raise serializers.ValidationError(
                {"error": "Cet administrateur a déjà un hôtel avec ce nom."}
            )

        # Créer l'hôtel
        hotel = Hotel.objects.create(**validated_data)

        # Ajouter les images si fournies
        for image in uploaded_images:
            HotelImages.objects.create(hotel=hotel, image=image)

        return hotel

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        deleted_images = validated_data.pop('deleted_images', [])

        # Mettre à jour l'instance existante
        instance = super().update(instance, validated_data)

        # Ajouter de nouvelles images si fournies
        for image in uploaded_images:
            TripImage.objects.create(trip=instance, image=image)

        # Supprimer les images spécifiées
        TripImage.objects.filter(id__in=deleted_images, trip=instance).delete()

        return instance

#----------------payment--------------------

from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"


# serializers.py
from rest_framework import serializers
from .models import Reservation1, Travel1

class TravelSerializer1(serializers.ModelSerializer):
    class Meta:
        model = Travel1
        fields = ['id', 'name', 'description', 'price']

class ReservationSerializer1(serializers.ModelSerializer):
    travel = TravelSerializer1(read_only=True)  # Pour afficher les détails du voyage
    travel_id = serializers.PrimaryKeyRelatedField(queryset=Travel1.objects.all(), write_only=True)  # Pour créer une réservation

    class Meta:
        model = Reservation1
        fields = ['id', 'user', 'travel', 'travel_id', 'amount', 'payment_status', 'created_at']
        read_only_fields = ['user', 'payment_status', 'created_at']  # Ces champs ne sont pas modifiables par l'utilisateur

    def create(self, validated_data):
        # Associer l'utilisateur connecté à la réservation
        validated_data['user'] = self.context['request'].user
        # Associer le montant du voyage à la réservation
        validated_data['amount'] = validated_data['travel_id'].price
        # Créer la réservation
        reservation = Reservation1.objects.create(**validated_data)
        return reservation    '''


#---------------------------------------------------------

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Customer,Admin,Trip,TripImage,DepartureTrip,HotelImages,Hotel
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
    






#------------------------  Hotels Serialiers ---------------------------------------
class HotelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelImages
        fields = ['id', 'image']

class HotelSerializer(serializers.ModelSerializer):
    images = HotelImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )  
    deleted_images = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    
    class Meta:
        model = Hotel
        fields = ['id','name', 'location','price_per_night' ,'phone', 'email', 'address', 'stars_rating', 'total_rooms',
                  'total_occupied_rooms', 'images', 'uploaded_images','amenities' ,'deleted_images']

    def validate(self, validated_data):
        name = validated_data.get("name", "").strip()
        total_rooms = validated_data.get("total_rooms", 0)
        total_occupied_rooms = validated_data.get("total_occupied_rooms", 0)
        star_rating = validated_data.get("star_rating", 3)
    

        if total_rooms < 0:
            raise ValidationError("ERROR: Total rooms cannot be negative.")

        if total_occupied_rooms > total_rooms:
            raise ValidationError("ERROR: The number of occupied rooms cannot exceed the total rooms.")

        if not (1 <= star_rating <= 5):
            raise ValidationError("ERROR: Star rating must be between 1 and 5.")

        # Validate room categories
    
        return validated_data
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])  
        hotel = Hotel.objects.create(**validated_data)

        for image in uploaded_images:
            HotelImages.objects.create(hotel=hotel, image=image)

        return hotel

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        deleted_images = validated_data.pop('deleted_images', [])

        instance = super().update(instance, validated_data)
        
        for image in uploaded_images:
            HotelImages.objects.create(hotel=instance, image=image)

        images_to_delete = HotelImages.objects.filter(id__in=deleted_images, hotel=instance)
        for image in images_to_delete:
            image.image.delete()
            image.delete()

        return instance




class TripImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripImage
        fields = ['id','image']

class DepartureTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartureTrip
        fields = ['id', 'location', 'capacity', 'sold_tickets', 'price']
        

    

class TripSerializer(serializers.ModelSerializer):
    sold_tickets = serializers.IntegerField(write_only=True)
    images = TripImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    deleted_images = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    departure_places = DepartureTripSerializer(many=True, required=False)

    class Meta:
        model = Trip
        fields = [
            'id', 'title', 'description', 'capacity', 'sold_tickets',
            'guide', 'trip_type', 'experience', 'price_category',
            'destination', 'destination_type', 'transport',
            'discount', 'created_by', 'stars_rating',
            'departure_date', 'return_date', 'is_one_way',
            'images', 'uploaded_images', 'deleted_images', 'departure_places'
        ]

    def validate(self, validated_data):
        trip_type = validated_data.get('trip_type', None)
        guide = validated_data.get('guide', None)
        if trip_type == 'group' and not guide:
            raise ValidationError('ERROR: group trips must have a guide')
        elif trip_type != 'group' and guide:
            raise ValidationError('ERROR: only group trips can have a guide')
        departure_date = validated_data.get('departure_date', None)
        return_date = validated_data.get('return_date', None)
        is_one_way = validated_data.get('is_one_way', False)
        if is_one_way and return_date:
            raise ValidationError('ERROR: a one way trip cannot have a return date')
        elif is_one_way and is_one_way == False and return_date is None:
            raise ValidationError('ERROR: the return date is missing')
        if departure_date and return_date and departure_date > return_date:
            raise ValidationError('ERROR: return date cannot be before departure date')
        return validated_data
    

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        departure_places_data = validated_data.pop("departure_places", [])

        trip = Trip.objects.create(**validated_data)

        for image in uploaded_images:
            TripImage.objects.create(trip=trip, image=image)

        # Set the trip reference explicitly when creating departures
        for departure_data in departure_places_data:
            DepartureTrip.objects.create(trip=trip, **departure_data)

        return trip

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        deleted_images = validated_data.pop('deleted_images', [])

        instance = super().update(instance, validated_data)

        for image in uploaded_images:
            TripImage.objects.create(trip=instance, image=image)


        to_delete = TripImage.objects.filter(id__in=deleted_images, trip=instance)
        for image in to_delete:
            image.image.delete()
            image.delete()
        return instance