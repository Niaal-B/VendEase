from django.urls import path
from .views import (
    VendorListCreateView,
    VendorRetrieveUpdateDestroyView,
    HistoricalPerformanceListView,
    VendorPerformanceView,
)

urlpatterns = [
    path("vendors/", VendorListCreateView.as_view(), name="vendor-list-create"),
    path("vendors/<int:pk>/", VendorRetrieveUpdateDestroyView.as_view(), name="vendor-detail"),
    path("vendors/<int:pk>/performance/", VendorPerformanceView.as_view(), name="vendor-performance"),
    path("vendor_performance_history/", HistoricalPerformanceListView.as_view(), name="vendor-performance-history"),
]