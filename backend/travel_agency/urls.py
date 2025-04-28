from django.contrib import admin
from django.urls import path,include,re_path
from django.conf import settings
from django.conf.urls.static import static
from main.views import path_not_found
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('',include('main.urls')),
    path('chatbot/',include('chatbot.urls')),
    path('reservation/',include('reservation.urls')),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema')),
    path('chat/',include('Chat.urls')),
    path('panel/',include('adminPanel.urls')),
   
      
]+static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



urlpatterns += [re_path(r"^(?P<path>.*)$",path_not_found )]
