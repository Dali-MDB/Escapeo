from django.urls import path
from . import views


urlpatterns = [
    path('password-reset/', view=views.RequestPasswordResetCodeView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', view=views.ConfirmPasswordResetCodeView.as_view(), name='password-reset-confirm'),
    path('update_profile_picture/',view=views.update_profile_picture,name='update-profile-picture'),
]