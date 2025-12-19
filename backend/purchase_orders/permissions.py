from rest_framework import permissions
from vendors.models import Vendor


class IsVendorOwner(permissions.BasePermission):
    """
    Permission to only allow vendors to access their own purchase orders.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has a vendor profile
        return hasattr(request.user, 'vendor_profile')
    
    def has_object_permission(self, request, view, obj):
        if not hasattr(request.user, 'vendor_profile'):
            return False
        
        vendor = request.user.vendor_profile
        return obj.vendor == vendor

