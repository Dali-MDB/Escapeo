from django.contrib import admin
from .models import User,Customer,Admin,Trip

# Register your models here.
admin.site.register(User)
admin.site.register(Customer)
admin.site.register(Admin)
admin.site.register(Trip)
