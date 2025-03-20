from django.contrib import admin
from django.urls import path,include,re_path
from django.conf import settings
from django.conf.urls.static import static
from main.views import path_not_found

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',include('main.urls')),
    re_path(r"^(?P<path>.*)$",path_not_found ),  
]+  static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
