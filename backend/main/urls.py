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
<<<<<<< HEAD


    #path('add_hotel/',view=views.addHotel,name='add-hotel'),
    #path('all_hotels/',view=views.allHotels,name='all-hotels'), 
    #path('hotel_details/<int:pk>',view=views.HotelDetails.as_view(),name='hotel-details'),
    #path('add_hotel_images/<int:id>',view=views.addHotelImages,name='add-hotel-image'),
    #path('delete_hotel_images/<int:id>',view=views.deleteHotelImages,name='delete-hotel-image'),
    #path('hotels/search/', view=views.search_hotels, name='search_hotels'),
    path('favorites/', view=views.list_favorite_trips, name='list_favorites'),
    path('favorites/add/<int:trip_id>/', view=views.add_to_favorites, name='add_favorite'),
    path('favorites/remove/<int:trip_id>/', view=views.remove_from_favorites, name='remove_favorite'),
    path('favorites/check/<int:trip_id>/', view=views.is_favorite, name='check_favorite'),


    path('get_user_info/',view=views.get_user_info,name='get-user-info'),
=======
    path('purchased_trips/',view=views.ListPurchasedTrips.as_view(),name='purchased-trips'),
>>>>>>> neil
    


    path('notifications/', view= views.get_user_notifications),
    path('notifications/unread-count/', view= views.get_unread_notification_count),
    path('notifications/read/<int:pk>/', view= views.mark_notification_as_read),
    path('notifications/delete/<int:pk>/', view= views.delete_notification),
    path('messages/<int:conversation_id>/', views.ListMessages.as_view(), name='list-messages'),
    path('messages/', views.CreateMessageView.as_view(), name='create-message'),
    path('conversations/', views.ListConversation.as_view(), name='list-conversations'),
    path('create-conversation/', views.CreateConversation.as_view(), name='create-conversation'),
    path('group-messages/<int:conversation_id>/', views.ListGroupMessages.as_view(), name='list-group-messages'),
    path('group-conversations/', views.ListGroupConversations.as_view(), name='list-group-conversations'),
    #path('support/tickets/',views.SupportTicketView.as_view(), name='support-tickets'),
    #path('support/tickets/<int:pk>/accept/',views.AcceptTicketView.as_view(), name='accept-ticket'),

    
]