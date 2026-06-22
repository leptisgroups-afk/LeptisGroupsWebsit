from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from offers.views import serve_secure_cv, admin_login, verify_otp

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', admin_login, name='api_token_auth'),
    path('api/verify-otp/', verify_otp, name='api_verify_otp'),
    path('media/cvs/<str:filename>', serve_secure_cv, name='serve_secure_cv'),
    path('', include('offers.urls')),  # includes /api/ endpoints
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
