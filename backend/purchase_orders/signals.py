from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from vendors.metrics import recalc_metrics
from .models import PurchaseOrder


@receiver(pre_save, sender=PurchaseOrder)
def set_actual_delivery_date(sender, instance: PurchaseOrder, **kwargs):
    """
    Auto-set actual_delivery_date when status changes to 'completed'
    if it's not already set.
    """
    if instance.status == "completed" and instance.actual_delivery_date is None:
        instance.actual_delivery_date = timezone.now()


@receiver([post_save, post_delete], sender=PurchaseOrder)
def update_vendor_metrics(sender, instance: PurchaseOrder, **kwargs):
    recalc_metrics(instance.vendor)

