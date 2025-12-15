from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('vendors.urls')),
    path('api/', include('purchase_orders.urls')),
    path('api/token/', views.obtain_auth_token),
]
