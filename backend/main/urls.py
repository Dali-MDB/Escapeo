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
    
    
]
