from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from main.models import Trip, Customer , Admin

class Review(models.Model):
    customer=models.ForeignKey(Customer,on_delete=models.CASCADE,related_name='reviews')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='reviews' )
    rating=models.PositiveSmallIntegerField(validators=[MinValueValidator(1),MaxValueValidator(5)],help_text="Rating from 1 to 5 stars")
    title=models.CharField(max_length=100)
    content=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved=models.BooleanField(default=False,help_text="Reviews need to be approved before being displayed")
    is_verified = models.BooleanField(default=False,help_text="Verified if the reviewer actually booked the trip" )

    class Meta:
        unique_together = ('customer', 'trip')  
        ordering = ['-created_at']
        verbose_name = "Review"
        verbose_name_plural = "Reviews"

    def __str__(self):
        return f"Review by {self.customer.user.username} for {self.trip.title}"

    def save(self, *args, **kwargs):
        
        if not self.is_verified and self.trip in self.customer.purchased_trips.all():
            self.is_verified = True
        super().save(*args, **kwargs)


class ReviewImage(models.Model):
    
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='review_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Review Image"
        verbose_name_plural = "Review Images"

    def __str__(self):
        return f"Image for review #{self.review.id}"

class ReviewReply(models.Model):
    """Model for admin replies to reviews"""
    review = models.OneToOneField(
        Review,
        on_delete=models.CASCADE,
        related_name='reply'
    )
    admin = models.ForeignKey( Admin,on_delete=models.SET_NULL,null=True,blank=True,related_name='review_replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Review Reply"
        verbose_name_plural = "Review Replies"
        ordering = ['-created_at']

    def __str__(self):
        return f"Reply to review #{self.review.id} by {self.admin.user.username if self.admin else 'system'}"
