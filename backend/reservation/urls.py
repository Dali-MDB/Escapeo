from django.urls import path
from . import views

urlpatterns = [
    path('get_trip_reservation_price/<int:trip_id>/',view=views.getTripReservationPrice,name='get-trip-reservation-price'),
    path('get_hotel_reservation_price/<int:hotel_id>/',view=views.getHotelReservationPrice,name='get-hotel-reservation-price'),

    path('initiate_hotel_reservation/<int:hotel_id>/',view=views.hotel_reservation_payment_init,name='initiate-hotel-reservation'),
    path('initiate_trip_reservation/<int:trip_id>/',view=views.trip_reservation_payment_init,name='initiate-trip-reservation'),

    path('confirm_payment/<int:reservation_id>/',view=views.simulate_payment_webhook,name='confirm-payment'),
    path('view_my_reservations/',view=views.view_my_reservations,name='view-my-reservations'),
    path('get_nearby_hotels/<int:trip_id>/',view=views.get_nearby_hotels,name='get-nearby-hotels'),

    path('cancel_hotel_reservation/<int:reservation_id>/',view=views.cancelHotelReservation,name='cancel-hotel-reservation'),
    path('cancel_trip_reservation/<int:reservation_id>/',view=views.cancelTripReservation,name='cancel-trip-reservation'),


    path('confirm_hotel_reservation_manually/<int:reservation_id>/',view=views.confirmHotelReservationManually,name='confirm-hotel-reservation-manually'),
    path('confirm_trip_reservation_manually/<int:reservation_id>/',view=views.confirmTripReservationManually,name='confirm-trip-reservation-manually'),
]
