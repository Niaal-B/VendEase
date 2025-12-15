from django.urls import path
from .views import (
    VendorListCreateView,
    VendorRetrieveUpdateDestroyView,
    HistoricalPerformanceListView,
)

urlpatterns = [
    path("vendors/", VendorListCreateView.as_view(), name="vendor-list-create"),
    path("vendors/<int:pk>/", VendorRetrieveUpdateDestroyView.as_view(), name="vendor-detail"),
    path("vendor_performance_history/", HistoricalPerformanceListView.as_view(), name="vendor-performance-history"),
]