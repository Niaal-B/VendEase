from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Vendor, HistoricalPerformance
from .serializers import (
    VendorSerializer,
    HistoricalPerformanceSerializer,
    VendorPerformanceSerializer,
    VendorRegistrationSerializer,
)

class VendorListCreateView(generics.ListCreateAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class VendorRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    lookup_field = "pk"

class VendorPerformanceView(generics.RetrieveAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorPerformanceSerializer
    lookup_field = "pk"

class HistoricalPerformanceListView(generics.ListAPIView):
    queryset = HistoricalPerformance.objects.select_related("vendor").all()
    serializer_class = HistoricalPerformanceSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def vendor_registration_view(request):
    """
    Register a new vendor account.
    
    Creates both a Django User and a Vendor profile linked together.
    Returns JWT tokens for immediate authentication.
    """
    serializer = VendorRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        result = serializer.save()
        return Response({
            'message': 'Vendor registered successfully',
            'vendor': VendorSerializer(result['vendor']).data,
            'access': result['access'],
            'refresh': result['refresh']
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)