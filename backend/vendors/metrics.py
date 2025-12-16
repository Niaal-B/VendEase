from django.db.models import Avg, F
from django.utils import timezone

from purchase_orders.models import PurchaseOrder
from .models import Vendor


def recalc_metrics(vendor: Vendor) -> None:
    """
    Recalculate and persist performance metrics for a vendor based on its purchase orders.
    """
    qs = PurchaseOrder.objects.filter(vendor=vendor)

    completed = qs.filter(status="completed")
    completed_count = completed.count()

    # On-time delivery: completed POs delivered on/before the expected date
    on_time_count = completed.filter(
        actual_delivery_date__isnull=False,
        actual_delivery_date__lte=F("expected_delivery_date"),
    ).count()
    on_time_rate = (on_time_count / completed_count * 100) if completed_count else 0.0

    # Quality rating average over completed POs (only those with ratings)
    quality_rated = completed.exclude(quality_rating__isnull=True)
    quality_avg = quality_rated.aggregate(avg=Avg("quality_rating"))["avg"] or 0.0

    # Average response time (hours) between issue and acknowledgment
    # Only count POs where acknowledgment_date >= issue_date (filter out negative times)
    acknowledged = qs.filter(
        acknowledgment_date__isnull=False,
        acknowledgment_date__gte=F("issue_date")
    )
    ack_count = acknowledged.count()
    if ack_count:
        diffs = acknowledged.annotate(diff=F("acknowledgment_date") - F("issue_date")).aggregate(
            avg=Avg("diff")
        )["avg"]
        avg_resp_hours = diffs.total_seconds() / 3600 if diffs else 0.0
    else:
        avg_resp_hours = 0.0

    # Fulfillment rate: completed over all POs (adjust if you add issue flags)
    total_pos = qs.count()
    fulfillment_rate = (completed_count / total_pos * 100) if total_pos else 0.0

    Vendor.objects.filter(pk=vendor.pk).update(
        on_time_delivery_rate=on_time_rate,
        quality_rating_avg=quality_avg,
        average_response_time=avg_resp_hours,
        fulfillment_rate=fulfillment_rate,
        updated_at=timezone.now(),
    )

