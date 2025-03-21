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
    
    path('add_admin/',view=views.addAdmin,name='add-admin'),
    path('my_profile/',view=views.MyProfile.as_view(),name='my-profile'),

    path('view_profile/<str:id>/',view=views.viewProfile,name='view-profile'),
    path('purchased_trips/',view=views.ListPurchasedTrips.as_view(),name='purchased-trips'),
    
    
]
