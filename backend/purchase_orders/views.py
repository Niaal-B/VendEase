from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from rest_framework.response import Response

from .models import PurchaseOrder
from .serializers import PurchaseOrderSerializer
from .permissions import IsVendorOwner


class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    queryset = PurchaseOrder.objects.select_related("vendor").all()
    serializer_class = PurchaseOrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["vendor"]


class PurchaseOrderRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin endpoint to retrieve, update, and delete purchase orders.
    Supports both PUT (full update) and PATCH (partial update).
    """
    queryset = PurchaseOrder.objects.select_related("vendor").all()
    serializer_class = PurchaseOrderSerializer
    lookup_field = "pk"
    
    def perform_update(self, serializer):
        serializer.save()


class PurchaseOrderAcknowledgeView(generics.UpdateAPIView):
    queryset = PurchaseOrder.objects.select_related("vendor").all()
    serializer_class = PurchaseOrderSerializer
    http_method_names = ["post"]
    lookup_field = "pk"

    def post(self, request, *args, **kwargs):
        po = self.get_object()
        if po.acknowledgment_date is None:
            po.acknowledgment_date = timezone.now()
        po.status = "acknowledged"
        po.save(update_fields=["acknowledgment_date", "status"])
        serializer = self.get_serializer(po)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VendorPurchaseOrderListView(generics.ListAPIView):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsVendorOwner]
    
    def get_queryset(self):
        vendor = self.request.user.vendor_profile
        return PurchaseOrder.objects.filter(vendor=vendor).select_related("vendor").order_by("-order_date")


class VendorPurchaseOrderDetailView(generics.RetrieveAPIView):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsVendorOwner]
    lookup_field = "pk"
    
    def get_queryset(self):
        vendor = self.request.user.vendor_profile
        return PurchaseOrder.objects.filter(vendor=vendor).select_related("vendor")


class VendorAcknowledgePurchaseOrderView(generics.UpdateAPIView):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsVendorOwner]
    http_method_names = ["post"]
    lookup_field = "pk"
    
    def get_queryset(self):
        vendor = self.request.user.vendor_profile
        return PurchaseOrder.objects.filter(vendor=vendor).select_related("vendor")
    
    def post(self, request, *args, **kwargs):
        po = self.get_object()
        
        if po.acknowledgment_date is None:
            po.acknowledgment_date = timezone.now()
        po.status = "acknowledged"
        
        update_fields = ["acknowledgment_date", "status"]
        if 'expected_delivery_date' in request.data:
            serializer = self.get_serializer(po, data={'expected_delivery_date': request.data['expected_delivery_date']}, partial=True)
            if serializer.is_valid():
                po.expected_delivery_date = serializer.validated_data.get('expected_delivery_date')
                update_fields.append("expected_delivery_date")
        
        po.save(update_fields=update_fields)
        return Response(self.get_serializer(po).data, status=status.HTTP_200_OK)