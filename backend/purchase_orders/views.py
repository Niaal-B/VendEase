from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import PurchaseOrder
from .serializers import PurchaseOrderSerializer

class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    queryset = PurchaseOrder.objects.select_related("vendor").all()
    serializer_class = PurchaseOrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["vendor"]

class PurchaseOrderRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseOrder.objects.select_related("vendor").all()
    serializer_class = PurchaseOrderSerializer
    lookup_field = "pk"