from django.contrib import admin
from django.urls import path, include
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

class PublicTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

class PublicTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("vendors.urls")),
    path("api/", include("purchase_orders.urls")),

    path("api/auth/token/", PublicTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", PublicTokenRefreshView.as_view(), name="token_refresh"),
]