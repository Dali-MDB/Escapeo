from django.db.models import Avg, Count
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Review, ReviewReply, ReviewImage
from .serializers import (ReviewSerializer, ReviewCreateSerializer, ReviewReplyCreateSerializer, ReviewReplySerializer)
from main.models import Trip

class TripReviewListView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, trip_id):
        reviews = Review.objects.filter(
            trip_id=trip_id, 
            is_approved=True
        ).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

class CustomerReviewListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        reviews = Review.objects.filter(
            customer=request.user.customer
        ).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

class ReviewCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, trip_id):
        trip = get_object_or_404(Trip, id=trip_id)
        customer = request.user.customer
        
        """if trip not in customer.purchased_trips.all():
            return Response(
                {"detail": "You can only review trips you've purchased"},
                status=status.HTTP_403_FORBIDDEN
            )"""
            
        if Review.objects.filter(customer=customer, trip=trip).exists():
            return Response(
                {"detail": "You've already reviewed this trip"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = ReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save(customer=customer, trip=trip, is_verified=True)
            
            for image in request.FILES.getlist('uploaded_images'):
                ReviewImage.objects.create(review=review, image=image)
                
            return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        serializer = ReviewSerializer(review)
        return Response(serializer.data)
    
    def put(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        
        if review.customer.user != request.user:
            return Response(
                {"detail": "You can only edit your own reviews."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        
        if review.customer.user != request.user:
            return Response(
                {"detail": "You can only delete your own reviews."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ReviewReplyCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, review_id):
        if not hasattr(request.user, 'admin'):
            return Response(
                {"detail": "Only admins can reply to reviews."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        review = get_object_or_404(Review, id=review_id)
        
        if hasattr(review, 'reply'):
            return Response(
                {"detail": "This review already has a reply."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = ReviewReplyCreateSerializer(data=request.data)
        if serializer.is_valid():
            reply = serializer.save(review=review, admin=request.user.admin)
            return Response(ReviewReplySerializer(reply).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewReplyUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, review_id):
        reply = get_object_or_404(ReviewReply, review_id=review_id)
        
        if reply.admin.user != request.user:
            return Response(
                {"detail": "You can only update your own replies."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = ReviewReplyCreateSerializer(reply, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ModerateReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, review_id):
        if not hasattr(request.user, 'admin'):
            return Response(
                {"detail": "Only admins can moderate reviews."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        review = get_object_or_404(Review, id=review_id)
        action = request.data.get('action')
        
        if action == 'approve':
            review.is_approved = True
            review.save()
            self.update_trip_rating(review.trip)
            return Response({"status": "Review approved"})
            
        elif action == 'reject':
            review.is_approved = False
            review.save()
            self.update_trip_rating(review.trip)
            return Response({"status": "Review rejected"})
            
        return Response(
            {"detail": "Invalid action. Use 'approve' or 'reject'."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def update_trip_rating(self, trip):
        """Calculate and update trip rating directly"""
        stats = Review.objects.filter(
            trip=trip,
            is_approved=True
        ).aggregate(
            average_rating=Avg('rating'),
            review_count=Count('id')
        )
        
        if stats['average_rating'] is not None:
            trip.stars_rating = round(stats['average_rating'], 1)
            trip.save(update_fields=['stars_rating'])

class TripReviewStatsView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, trip_id):
        trip = get_object_or_404(Trip, id=trip_id)
        
        # Get base stats
        stats = Review.objects.filter(
            trip=trip,
            is_approved=True
        ).aggregate(
            average_rating=Avg('rating'),
            review_count=Count('id'),
            verified_review_count=Count('id', filter=models.Q(is_verified=True))
        )
        
        # Get rating distribution
        rating_distribution = (
            Review.objects
            .filter(trip=trip, is_approved=True)
            .values('rating')
            .annotate(count=Count('rating'))
            .order_by('rating')
        )
        
        distribution = {1:0, 2:0, 3:0, 4:0, 5:0}
        for item in rating_distribution:
            distribution[item['rating']] = item['count']
        
        return Response({
            'average_rating': stats['average_rating'],
            'review_count': stats['review_count'],
            'verified_review_count': stats['verified_review_count'],
            'rating_distribution': distribution,
            'stars_rating': trip.stars_rating
        })