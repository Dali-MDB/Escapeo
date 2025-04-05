from rest_framework import serializers
from .models import HotelReservation, TripReservation
from rest_framework.exceptions import ValidationError
from .models import TripReservation,HotelReservation
from main.models import Hotel
from django.shortcuts import get_object_or_404



class HotelReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelReservation
        fields = '__all__'


    '''
    def validate(self, data):
        # Date validation
        if data['check_in'] >= data['check_out']:
            raise serializers.ValidationError("Check-out must be after check-in")
        
        # Room availability (only for new reservations)
        if not self.instance:  # Only check on creation
            hotel = get_object_or_404(Hotel,id=data['hotel_id'])
            if data['rooms'] > (hotel.total_rooms - hotel.total_occupied_rooms):
                raise serializers.ValidationError(
                    f"Only {hotel.total_rooms - hotel.total_occupied_rooms} rooms available"
                )
            
        
        return data
    

    def create(self, validated_data):
        hotel = get_object_or_404(Hotel,id=validated_data['hotel_id'])
        hotel.total_occupied_rooms += validated_data['rooms']
        hotel.save()
        return super().create(validated_data)

'''
class TripReservationSerializer(serializers.ModelSerializer):
    hotel_reservation = HotelReservationSerializer()
    class Meta:
        model = TripReservation
        fields = '__all__'