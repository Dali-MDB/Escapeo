from rest_framework import serializers
from .models import Review, ReviewImage, ReviewReply
from main.models import Trip, Customer
from main.serializers import TripSerializer, CustomerSerializer

class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta :
        model = ReviewImage
        fields= ['id','image','uploaded_at']
        read_only_fields=['uploaded_at']


class ReviewReplySerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.user.username', read_only=True)
    admin_profile_picture = serializers.ImageField(source='admin.profile_picture', read_only=True)

    class Meta:
        model = ReviewReply
        fields = ['id', 'content', 'created_at', 'updated_at', 'admin_name', 'admin_profile_picture']
        read_only_fields = ['created_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    trip = TripSerializer(read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)
    reply = ReviewReplySerializer(read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Review
        fields = [
            'id', 'customer', 'trip', 'rating', 'title', 'content',
            'created_at', 'updated_at', 'is_approved', 'is_verified',
            'images', 'uploaded_images', 'reply'
        ]
        read_only_fields = [
            'customer', 'trip', 'created_at', 'updated_at',
            'is_approved', 'is_verified', 'reply'
        ]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        request = self.context.get('request')
        
        # Ensure the customer has purchased the trip before allowing review
        trip = validated_data['trip']
        customer = request.user.customer
        
        if trip not in customer.purchased_trips.all():
            raise serializers.ValidationError("You can only review trips you've purchased")

        review = Review.objects.create(customer=customer, **validated_data)
        
        for image in uploaded_images:
            ReviewImage.objects.create(review=review, image=image)
            
        return review


class ReviewCreateSerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=100000, allow_empty_file=False, use_url=False),
        required=False
    )

    class Meta:
        model = Review
        fields = ['trip', 'rating', 'title', 'content', 'uploaded_images']

    def validate(self, data):
        request = self.context.get('request')
        trip = data.get('trip')
        
        if not request.user.is_authenticated or not hasattr(request.user, 'customer'):
            raise serializers.ValidationError("Only customers can leave reviews")
            
        if Review.objects.filter(customer=request.user.customer, trip=trip).exists():
            raise serializers.ValidationError("You've already reviewed this trip")
            
        if trip not in request.user.customer.purchased_trips.all():
            raise serializers.ValidationError("You can only review trips you've purchased")
            
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        uploaded_images = validated_data.pop('uploaded_images', [])
        customer = request.user.customer
        
        review = Review.objects.create(
            customer=customer,
            trip=validated_data['trip'],
            rating=validated_data['rating'],
            title=validated_data['title'],
            content=validated_data['content'],
            is_verified=True  # Auto-verified since we checked purchase
        )
        
        for image in uploaded_images:
            ReviewImage.objects.create(review=review, image=image)
            
        return review

class ReviewReplyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReply
        fields = ['content']

    def create(self, validated_data):
        request = self.context.get('request')
        review_id = self.context.get('review_id')
        
        if not request.user.is_authenticated or not hasattr(request.user, 'admin'):
            raise serializers.ValidationError("Only admins can reply to reviews")
            
        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            raise serializers.ValidationError("Review not found")
            
        if hasattr(review, 'reply'):
            raise serializers.ValidationError("This review already has a reply")
            
        return ReviewReply.objects.create(
            review=review,
            admin=request.user.admin,
            content=validated_data['content']
        )