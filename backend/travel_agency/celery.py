import os
from celery import Celery


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travel_agency.settings')

app = Celery('travel_agency')

app.config_from_object('django.conf:settings', namespace='CELERY')


app.autodiscover_tasks()

