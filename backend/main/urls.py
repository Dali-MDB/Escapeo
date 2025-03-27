from django.urls import path
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

    
]
   
    

