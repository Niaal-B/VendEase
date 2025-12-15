from django.urls import path
from .views import (
    PurchaseOrderListCreateView,
    PurchaseOrderRetrieveUpdateDestroyView,
    PurchaseOrderAcknowledgeView,
)

urlpatterns = [
    path("purchase_orders/", PurchaseOrderListCreateView.as_view(), name="po-list-create"),
    path("purchase_orders/<int:pk>/", PurchaseOrderRetrieveUpdateDestroyView.as_view(), name="po-detail"),
    path(
        "purchase_orders/<int:pk>/acknowledge/",
        PurchaseOrderAcknowledgeView.as_view(),
        name="po-acknowledge",
    ),
]