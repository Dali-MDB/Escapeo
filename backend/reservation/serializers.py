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





class TripReservationSerializer(serializers.ModelSerializer):
    hotel_reservation = HotelReservationSerializer()
    class Meta:
        model = TripReservation
        fields = '__all__'



class HotelReservationWithTripSerializer(serializers.ModelSerializer):
    trip_reservation = TripReservationSerializer()
    class Meta:
        model = HotelReservation
        fields = '__all__'