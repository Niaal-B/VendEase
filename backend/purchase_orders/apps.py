from django.apps import AppConfig


class PurchaseOrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'purchase_orders'

    def ready(self):
        # Import signal handlers to wire up metrics recalculation.
        import purchase_orders.signals  # noqa: F401
