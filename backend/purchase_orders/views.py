from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from rest_framework.response import Response

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


class PurchaseOrderAcknowledgeView(generics.UpdateAPIView):
    queryset = PurchaseOrder.objects.select_related("vendor").all()
    serializer_class = PurchaseOrderSerializer
    http_method_names = ["post"]
    lookup_field = "pk"

    def post(self, request, *args, **kwargs):
        po = self.get_object()
        if po.acknowledgment_date is None:
            now = timezone.now()
            po.acknowledgment_date = max(now, po.issue_date)
        po.status = "acknowledged"
        po.save(update_fields=["acknowledgment_date", "status"])
        serializer = self.get_serializer(po)
        return Response(serializer.data, status=status.HTTP_200_OK)