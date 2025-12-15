from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("vendors.urls")),
    path("api/", include("purchase_orders.urls")),
    path("api/auth/", include("rest_framework_simplejwt.urls")),  
]