from django.urls import path
from .views import VisitorStatsView , TrackVisitView , monthly_visitor_count , daily_visitor_count ,  yearly_visitor_count
from .views import top_5_destinations , top_destinations , most_visited_paths , UserCountView
urlpatterns = [
    path('stats/visitors/', VisitorStatsView.as_view(), name='visitor-stats'),# cet endpoint n'est pas vraiment fonctionel A 100% mais elle est correcte
    path('track/', TrackVisitView.as_view(), name='track-visit'),
    path('visitors/monthly/', monthly_visitor_count, name='monthly-visitors'),
    path('visitors/daily/', daily_visitor_count, name='daily-visitors'),
    path('visitors/yearlyy/', yearly_visitor_count, name='yearly-visitors'),
    path('top_destinations/',top_destinations,name='top_destinations'), # si on veut faire un filtre du top destinations par mos ou last 7 days ou year on ajoute apres Top_destinations/?filter=last_7_days or last_month or last year
    path('top_5_destinations/',top_5_destinations,name='top_5_destinations'),
    path('most_visited_paths/', most_visited_paths, name='most_visited_paths'),
    path('number_of_users/',UserCountView.as_view(),name='user-count'),
    path('number_of_users/<str:type>/',UserCountView.as_view(),name='user-type-count'), #type : customer or admin
]
