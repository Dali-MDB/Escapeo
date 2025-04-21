'''from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import BookingAPIView
from .views import allHotels, HotelDetails  # Assurez-vous que le nom est correct

from main.views import allHotels,addHotel # Assurez-vous que l'import est correct
#from .views import create_payment
#from .views import create_trip_payment
#from .views import execute_trip_payment
#from .views import execute_payment
#from .views import CreatePaymentView1, PaymentSuccessView1, PaymentCancelView1 , CreateReservationView1

urlpatterns = [
    path('home/',view=views.home,name='home'),


    path('register/',view=views.register ,name='register'),
    path('login/',view=views.login,name='login'),
    path('logout/',view=views.logout,name='logout'),
    path('get_refresh/',view=views.get_refresh,name='get-refresh'),

    path('add_trip/',view=views.addTrip,name='add-trip'),
    path('all_trips/',view=views.allTrips,name='all-trips'), 
    path('trip_details/<int:pk>',view=views.tripDetails.as_view(),name='trip-details'),
    
    path('hotels/', view=allHotels, name='all-hotels'),
    path('hotels/add/', view=addHotel, name='add-hotel'),  # Ajouter un hôtel
    path('hotels/<int:pk>/', view=HotelDetails.as_view(), name='hotel-details'),  # Détails, mise à jour, suppression d'un hôtel
    path("booking/", BookingAPIView.as_view(), name="booking_api"), 
    
    #path("payment/", create_payment, name="create_payment"), 
    #path("payment/success/", execute_payment, name="execute_payment"),

    #path("payment/trip/<int:trip_id>/", create_trip_payment, name="create_trip_payment"),
    #path("payment/success/", execute_trip_payment, name="execute_trip_payment"),  

    #path('create-payment/', CreatePaymentView1.as_view(), name='create-payment'),
    #path('payment/success/', PaymentSuccessView1.as_view(), name='payment-success'),
    #path('payment/cancel/', PaymentCancelView1.as_view(), name='payment-cancel'),
    #path('reservations/create/', CreateReservationView1.as_view(), name='create-reservation'),

    
]'''

from django.urls import path, re_path
from . import views

urlpatterns = [
    path('home/',view=views.home,name='home'),


    path('register/',view=views.register ,name='register'),
    path('login/',view=views.login,name='login'),
    path('logout/',view=views.logout,name='logout'),
    path('get_refresh/',view=views.get_refresh,name='get-refresh'),

    path('add_trip/',view=views.addTrip,name='add-trip'),
    path('all_trips/',view=views.allTrips,name='all-trips'), 
    path('trip_details/<int:pk>',view=views.tripDetails.as_view(),name='trip-details'),
    path('add_trip_images/<int:id>',view=views.addTripImages,name='add-trip-image'),
    path('delete_trip_images/<int:id>',view=views.deleteTripImages,name='delete-trip-image'),
    path('add_trip_departure/<int:trip_id>',view=views.addDeparture,name='add-trip-departure'),
    path('departure_details/<int:trip_id>/<int:departure_id>',view=views.DepartureDetails.as_view(),name='departure-details'),

    path('search_trips/',view=views.TripsFiltering,name='search-trips'),
    path('recommended_trips/',view=views.recommendedTrips,name='recommended-trips'),
    
    path('add_admin/',view=views.addAdmin,name='add-admin'),
    path('my_profile/',view=views.MyProfile.as_view(),name='my-profile'),

    path('view_profile/<str:id>/',view=views.viewProfile,name='view-profile'),


    path('add_hotel/',view=views.addHotel,name='add-hotel'),
    path('all_hotels/',view=views.allHotels,name='all-hotels'), 
    path('hotel_details/<int:pk>',view=views.HotelDetails.as_view(),name='hotel-details'),
    path('add_hotel_images/<int:id>',view=views.addHotelImages,name='add-hotel-image'),
    path('delete_hotel_images/<int:id>',view=views.deleteHotelImages,name='delete-hotel-image'),
     path('get_user_info/',view=views.get_user_info,name='get-user-info'),

]
   
    

