from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from vendors.metrics import recalc_metrics
from .models import PurchaseOrder


@receiver([post_save, post_delete], sender=PurchaseOrder)
def update_vendor_metrics(sender, instance: PurchaseOrder, **kwargs):
    recalc_metrics(instance.vendor)

