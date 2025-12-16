from django.core.management.base import BaseCommand
from django.utils import timezone
from vendors.models import Vendor
from purchase_orders.models import PurchaseOrder
from datetime import timedelta


class Command(BaseCommand):
    help = 'Seed database with test vendor and purchase order data for testing metrics'

    def handle(self, *args, **options):
        self.stdout.write('Creating test data...')

        # Create Test Vendor
        vendor, created = Vendor.objects.get_or_create(
            vendor_code="TEST001",
            defaults={
                "name": "Test Vendor Corp",
                "contact_details": "Email: test@vendor.com, Phone: +1-555-9999",
                "address": "100 Test Street, Test City, TC 12345",
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created vendor: {vendor.name}'))
        else:
            self.stdout.write(f'Vendor {vendor.name} already exists, using existing vendor')
            # Delete existing POs for this vendor to start fresh
            PurchaseOrder.objects.filter(vendor=vendor).delete()
            self.stdout.write('Cleared existing purchase orders for this vendor')

        # Create Purchase Orders
        now = timezone.now()
        
        # PO 1: Pending (will be acknowledged)
        po1, _ = PurchaseOrder.objects.get_or_create(
            po_number="PO-TEST-001",
            defaults={
                "vendor": vendor,
                "order_date": now - timedelta(days=2),
                "expected_delivery_date": now + timedelta(days=5),
                "actual_delivery_date": None,
                "items": {"product": "Widget A", "category": "Electronics"},
                "quantity": 50,
                "status": "pending",
                "quality_rating": None,
                "issue_date": now - timedelta(days=2),
                "acknowledgment_date": None,
            }
        )

        # PO 2: Will be completed with quality rating
        po2, _ = PurchaseOrder.objects.get_or_create(
            po_number="PO-TEST-002",
            defaults={
                "vendor": vendor,
                "order_date": now - timedelta(days=3),
                "expected_delivery_date": now + timedelta(days=3),
                "actual_delivery_date": None,
                "items": {"product": "Widget B", "category": "Electronics"},
                "quantity": 100,
                "status": "pending",
                "quality_rating": None,
                "issue_date": now - timedelta(days=3),
                "acknowledgment_date": None,
            }
        )

        # PO 3: Will be completed with different quality rating
        po3, _ = PurchaseOrder.objects.get_or_create(
            po_number="PO-TEST-003",
            defaults={
                "vendor": vendor,
                "order_date": now - timedelta(days=1),
                "expected_delivery_date": now + timedelta(days=7),
                "actual_delivery_date": None,
                "items": {"product": "Widget C", "category": "Electronics"},
                "quantity": 75,
                "status": "pending",
                "quality_rating": None,
                "issue_date": now - timedelta(days=1),
                "acknowledgment_date": None,
            }
        )

        self.stdout.write(self.style.SUCCESS(f'Created {PurchaseOrder.objects.filter(vendor=vendor).count()} purchase orders'))
        self.stdout.write(self.style.SUCCESS('\nTest data created successfully!'))
        self.stdout.write('\nNext steps:')
        self.stdout.write('1. Acknowledge PO-TEST-001 to test response time')
        self.stdout.write('2. Complete PO-TEST-002 with quality rating 4.5')
        self.stdout.write('3. Complete PO-TEST-003 with quality rating 3.8')
        self.stdout.write('4. Check vendor metrics on the Vendors page')

