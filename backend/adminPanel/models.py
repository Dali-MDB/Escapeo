from django.db import models

class Visit(models.Model):
    class Meta:
        app_label = 'adminPanel'  # Add this
    
    ip_address = models.GenericIPAddressField()
    country = models.CharField(max_length=100, blank=True, null=True)
    path = models.CharField(max_length=255)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.ip_address} visited {self.path}"

class Visitor(models.Model):
    class Meta:
        app_label = 'adminPanel'  # Add this
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    path = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.ip_address} at {self.timestamp}"