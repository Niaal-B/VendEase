from rest_framework import generics
from .models import Vendor, HistoricalPerformance
from .serializers import VendorSerializer, HistoricalPerformanceSerializer

class VendorListCreateView(generics.ListCreateAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class VendorRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    lookup_field = "pk"

class HistoricalPerformanceListView(generics.ListAPIView):
    queryset = HistoricalPerformance.objects.select_related("vendor").all()
    serializer_class = HistoricalPerformanceSerializer