from django.urls import path
from .views import (TripReviewListView,CustomerReviewListView,ReviewCreateView,ReviewDetailView,ReviewReplyCreateView,ReviewReplyUpdateView,ModerateReviewView,TripReviewStatsView)

urlpatterns = [
    # Review endpoints
    path('trips/<uuid:trip_id>/reviews/', TripReviewListView.as_view(), name='trip-reviews-list'),
    path('trips/<int:trip_id>/reviews/create/', ReviewCreateView.as_view(), name='review-create'),
    path('trips/<uuid:trip_id>/reviews/stats/', TripReviewStatsView.as_view(), name='trip-review-stats'),
    path('reviews/', CustomerReviewListView.as_view(), name='customer-reviews-list'),
    path('reviews/<uuid:pk>/', ReviewDetailView.as_view(), name='review-detail'),
    path('reviews/<uuid:review_id>/moderate/', ModerateReviewView.as_view(), name='moderate-review'),
    # Review reply endpoints
    path('reviews/<uuid:review_id>/reply/', ReviewReplyCreateView.as_view(), name='review-reply-create'),
    path('reviews/<uuid:review_id>/reply/update/', ReviewReplyUpdateView.as_view(), name='review-reply-update'),
]