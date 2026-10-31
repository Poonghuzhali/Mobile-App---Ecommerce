from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import EmailOrUsernameTokenObtainPairView
from config.health import health

urlpatterns = [
    path("api/health/", health),
    path("django-admin/", admin.site.urls),
    path("portal/", include("adminpanel.urls")),
    path("api/auth/token/", EmailOrUsernameTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/", include("accounts.urls")),
    path("api/admin/", include("adminpanel.api_urls")),
    path("api/catalog/", include("catalog.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/notifications/", include("notifications.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0] if settings.STATICFILES_DIRS else settings.STATIC_ROOT)
