from django.urls import path
from .views import (
    PurchaseOrderListCreateView,
    PurchaseOrderRetrieveUpdateDestroyView,
    PurchaseOrderAcknowledgeView,
    VendorPurchaseOrderListView,
    VendorPurchaseOrderDetailView,
    VendorAcknowledgePurchaseOrderView,
)

urlpatterns = [
    path("purchase_orders/", PurchaseOrderListCreateView.as_view(), name="po-list-create"),
    path("purchase_orders/<int:pk>/", PurchaseOrderRetrieveUpdateDestroyView.as_view(), name="po-detail"),
    path(
        "purchase_orders/<int:pk>/acknowledge/",
        PurchaseOrderAcknowledgeView.as_view(),
        name="po-acknowledge",
    ),
    # Vendor-specific endpoints
    path("vendor/purchase_orders/", VendorPurchaseOrderListView.as_view(), name="vendor-po-list"),
    path("vendor/purchase_orders/<int:pk>/", VendorPurchaseOrderDetailView.as_view(), name="vendor-po-detail"),
    path(
        "vendor/purchase_orders/<int:pk>/acknowledge/",
        VendorAcknowledgePurchaseOrderView.as_view(),
        name="vendor-po-acknowledge",
    ),
]