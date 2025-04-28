from django.urls import path
from . import views

urlpatterns = [
    path('chat/',view=views.talkToMelio,name='chat'),
]