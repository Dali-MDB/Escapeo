from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Reservation
from .tasks import expire_unpaid_reservations
from datetime import timedelta
from django.utils import timezone

@receiver(post_save,sender=Reservation)
def schedule_reservation_expiry(sender, instance, created, **kwargs):
    if created and instance.status == 'Pending':
        eta = timezone.now() + timedelta(hours=48)
        expire_unpaid_reservations.apply_async(eta=eta)