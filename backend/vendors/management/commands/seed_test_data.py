from django.core.management.base import BaseCommand
from django.utils import timezone
from vendors.models import Vendor
from purchase_orders.models import PurchaseOrder
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Seed database with comprehensive test data including multiple vendors and purchase orders'

    def handle(self, *args, **options):
        self.stdout.write('Creating comprehensive test data...')
        
        # Clear existing data
        PurchaseOrder.objects.all().delete()
        Vendor.objects.all().delete()
        self.stdout.write('Cleared existing data')

        now = timezone.now()
        
        # Create multiple vendors with different performance profiles
        vendors_data = [
            {
                "vendor_code": "TECH001",
                "name": "TechCorp Solutions",
                "contact_details": "Email: contact@techcorp.com, Phone: +1-555-0101",
                "address": "123 Tech Street, Silicon Valley, CA 94000",
            },
            {
                "vendor_code": "GSI002",
                "name": "Global Supplies Inc",
                "contact_details": "Email: info@globalsupplies.com, Phone: +1-555-0202",
                "address": "456 Commerce Blvd, New York, NY 10001",
            },
            {
                "vendor_code": "PMC003",
                "name": "Premium Manufacturing Co",
                "contact_details": "Email: sales@premiummfg.com, Phone: +1-555-0303",
                "address": "789 Industrial Park, Chicago, IL 60601",
            },
            {
                "vendor_code": "QUICK004",
                "name": "QuickShip Logistics",
                "contact_details": "Email: support@quickship.com, Phone: +1-555-0404",
                "address": "321 Express Way, Dallas, TX 75201",
            },
            {
                "vendor_code": "ELITE005",
                "name": "Elite Components Ltd",
                "contact_details": "Email: contact@elitecomp.com, Phone: +1-555-0505",
                "address": "654 Quality Drive, Boston, MA 02101",
            },
        ]

        vendors = []
        for vendor_data in vendors_data:
            vendor = Vendor.objects.create(**vendor_data)
            vendors.append(vendor)
            self.stdout.write(self.style.SUCCESS(f'Created vendor: {vendor.name} ({vendor.vendor_code})'))

        # Create purchase orders with various states and dates
        po_data = []
        
        # TechCorp Solutions - Good performance
        vendor1 = vendors[0]
        po_data.extend([
            {
                "vendor": vendor1,
                "po_number": "PO-TECH-001",
                "order_date": now - timedelta(days=30),
                "expected_delivery_date": now - timedelta(days=20),
                "actual_delivery_date": now - timedelta(days=20),
                "items": {"product": "Laptop Components", "unit_price": 250.00, "category": "Electronics"},
                "quantity": 100,
                "status": "completed",
                "quality_rating": 4.8,
                "issue_date": now - timedelta(days=30),
                "acknowledgment_date": now - timedelta(days=29, hours=2),  # 22 hours: 30d to 29d-2h = 1d - 2h = 24h - 2h = 22h
            },
            {
                "vendor": vendor1,
                "po_number": "PO-TECH-002",
                "order_date": now - timedelta(days=25),
                "expected_delivery_date": now - timedelta(days=15),
                "actual_delivery_date": now - timedelta(days=15),
                "items": {"product": "Server Hardware", "unit_price": 500.00, "category": "Electronics"},
                "quantity": 50,
                "status": "completed",
                "quality_rating": 4.9,
                "issue_date": now - timedelta(days=25),
                "acknowledgment_date": now - timedelta(days=24, hours=2),  # 22 hours: 25d to 24d-2h = 1d - 2h = 22h
            },
            {
                "vendor": vendor1,
                "po_number": "PO-TECH-003",
                "order_date": now - timedelta(days=10),
                "expected_delivery_date": now + timedelta(days=5),
                "actual_delivery_date": None,
                "items": {"product": "Network Equipment", "unit_price": 300.00, "category": "Electronics"},
                "quantity": 75,
                "status": "acknowledged",
                "quality_rating": None,
                "issue_date": now - timedelta(days=10),
                "acknowledgment_date": now - timedelta(days=9, hours=2),  # 22 hours: 10d to 9d-2h = 1d - 2h = 22h (avg = 22.0)
            },
            {
                "vendor": vendor1,
                "po_number": "PO-TECH-004",
                "order_date": now - timedelta(days=5),
                "expected_delivery_date": now + timedelta(days=10),
                "actual_delivery_date": None,
                "items": {"product": "Storage Devices", "unit_price": 150.00, "category": "Electronics"},
                "quantity": 200,
                "status": "pending",
                "quality_rating": None,
                "issue_date": now - timedelta(days=5),
                "acknowledgment_date": None,
            },
        ])

        # Global Supplies Inc - Average performance
        vendor2 = vendors[1]
        po_data.extend([
            {
                "vendor": vendor2,
                "po_number": "PO-GSI-001",
                "order_date": now - timedelta(days=28),
                "expected_delivery_date": now - timedelta(days=18),
                "actual_delivery_date": now - timedelta(days=17),  # Late delivery (1 day late)
                "items": {"product": "Office Supplies", "unit_price": 25.00, "category": "Stationery"},
                "quantity": 500,
                "status": "completed",
                "quality_rating": 3.5,
                "issue_date": now - timedelta(days=28),
                "acknowledgment_date": now - timedelta(days=27, hours=8, minutes=20),  # 15.7 hours: 28d to 27d-8h20m = 1d - 8h20m = 24h - 8h20m = 15h40m ≈ 15.7h
            },
            {
                "vendor": vendor2,
                "po_number": "PO-GSI-002",
                "order_date": now - timedelta(days=20),
                "expected_delivery_date": now - timedelta(days=10),
                "actual_delivery_date": now - timedelta(days=10),
                "items": {"product": "Packaging Materials", "unit_price": 10.00, "category": "Packaging"},
                "quantity": 1000,
                "status": "completed",
                "quality_rating": 4.0,
                "issue_date": now - timedelta(days=20),
                "acknowledgment_date": now - timedelta(days=19, hours=8, minutes=20),  # 15.7 hours: 20d to 19d-8h20m = 1d - 8h20m = 15h40m
            },
            {
                "vendor": vendor2,
                "po_number": "PO-GSI-003",
                "order_date": now - timedelta(days=8),
                "expected_delivery_date": now + timedelta(days=7),
                "actual_delivery_date": None,
                "items": {"product": "Cleaning Supplies", "unit_price": 15.00, "category": "Maintenance"},
                "quantity": 300,
                "status": "acknowledged",
                "quality_rating": None,
                "issue_date": now - timedelta(days=8),
                "acknowledgment_date": now - timedelta(days=7, hours=8, minutes=20),  # 15.7 hours: 8d to 7d-8h20m = 15h40m (avg ≈ 15.7)
            },
        ])

        # Premium Manufacturing Co - Excellent performance
        vendor3 = vendors[2]
        po_data.extend([
            {
                "vendor": vendor3,
                "po_number": "PO-PMC-001",
                "order_date": now - timedelta(days=35),
                "expected_delivery_date": now - timedelta(days=25),
                "actual_delivery_date": now - timedelta(days=25),  # On-time (equal to expected)
                "items": {"product": "Precision Tools", "unit_price": 450.00, "category": "Manufacturing"},
                "quantity": 80,
                "status": "completed",
                "quality_rating": 5.0,
                "issue_date": now - timedelta(days=35),
                "acknowledgment_date": now - timedelta(days=34, hours=1, minutes=30),  # 22.5 hours: 35d to 34d-1h30m = 1d - 1h30m = 24h - 1h30m = 22h30m = 22.5h
            },
            {
                "vendor": vendor3,
                "po_number": "PO-PMC-002",
                "order_date": now - timedelta(days=22),
                "expected_delivery_date": now - timedelta(days=12),
                "actual_delivery_date": now - timedelta(days=13),  # Early delivery (on-time)
                "items": {"product": "Machine Parts", "unit_price": 350.00, "category": "Manufacturing"},
                "quantity": 120,
                "status": "completed",
                "quality_rating": 4.9,
                "issue_date": now - timedelta(days=22),
                "acknowledgment_date": now - timedelta(days=21, hours=1, minutes=30),  # 22.5 hours: 22d to 21d-1h30m = 22h30m
            },
            {
                "vendor": vendor3,
                "po_number": "PO-PMC-003",
                "order_date": now - timedelta(days=15),
                "expected_delivery_date": now - timedelta(days=5),
                "actual_delivery_date": now - timedelta(days=6),  # Early delivery (on-time)
                "items": {"product": "Quality Control Equipment", "unit_price": 600.00, "category": "Manufacturing"},
                "quantity": 40,
                "status": "completed",
                "quality_rating": 5.0,
                "issue_date": now - timedelta(days=15),
                "acknowledgment_date": now - timedelta(days=14, hours=1, minutes=30),  # 22.5 hours: 15d to 14d-1h30m = 22h30m
            },
            {
                "vendor": vendor3,
                "po_number": "PO-PMC-004",
                "order_date": now - timedelta(days=7),
                "expected_delivery_date": now + timedelta(days=8),
                "actual_delivery_date": None,
                "items": {"product": "Assembly Components", "unit_price": 200.00, "category": "Manufacturing"},
                "quantity": 150,
                "status": "acknowledged",
                "quality_rating": None,
                "issue_date": now - timedelta(days=7),
                "acknowledgment_date": now - timedelta(days=6, hours=1, minutes=30),  # 22.5 hours: 7d to 6d-1h30m = 22h30m (avg = 22.5)
            },
        ])

        # QuickShip Logistics - Fast response, variable quality
        vendor4 = vendors[3]
        po_data.extend([
            {
                "vendor": vendor4,
                "po_number": "PO-QUICK-001",
                "order_date": now - timedelta(days=18),
                "expected_delivery_date": now - timedelta(days=8),
                "actual_delivery_date": now - timedelta(days=8),
                "items": {"product": "Shipping Supplies", "unit_price": 20.00, "category": "Logistics"},
                "quantity": 400,
                "status": "completed",
                "quality_rating": 3.8,
                "issue_date": now - timedelta(days=18),
                "acknowledgment_date": now - timedelta(days=18, hours=0),  # ~0 hours response (immediate)
            },
            {
                "vendor": vendor4,
                "po_number": "PO-QUICK-002",
                "order_date": now - timedelta(days=12),
                "expected_delivery_date": now - timedelta(days=2),
                "actual_delivery_date": now - timedelta(days=1),  # Late delivery (1 day late)
                "items": {"product": "Delivery Vehicles Parts", "unit_price": 180.00, "category": "Logistics"},
                "quantity": 60,
                "status": "completed",
                "quality_rating": 4.2,
                "issue_date": now - timedelta(days=12),
                "acknowledgment_date": now - timedelta(days=12, hours=0),  # ~0 hours response (avg = 0.0)
            },
            {
                "vendor": vendor4,
                "po_number": "PO-QUICK-003",
                "order_date": now - timedelta(days=3),
                "expected_delivery_date": now + timedelta(days=12),
                "actual_delivery_date": None,
                "items": {"product": "Warehouse Equipment", "unit_price": 320.00, "category": "Logistics"},
                "quantity": 90,
                "status": "pending",
                "quality_rating": None,
                "issue_date": now - timedelta(days=3),
                "acknowledgment_date": None,
            },
        ])

        # Elite Components Ltd - High quality, slower response
        vendor5 = vendors[4]
        po_data.extend([
            {
                "vendor": vendor5,
                "po_number": "PO-ELITE-001",
                "order_date": now - timedelta(days=32),
                "expected_delivery_date": now - timedelta(days=22),
                "actual_delivery_date": now - timedelta(days=23),  # Early delivery (on-time)
                "items": {"product": "Premium Components", "unit_price": 800.00, "category": "Electronics"},
                "quantity": 30,
                "status": "completed",
                "quality_rating": 4.7,
                "issue_date": now - timedelta(days=32),
                "acknowledgment_date": now - timedelta(days=30, hours=8),  # 40 hours: 32d to 30d-8h = 2d - 8h = 48h - 8h = 40h
            },
            {
                "vendor": vendor5,
                "po_number": "PO-ELITE-002",
                "order_date": now - timedelta(days=14),
                "expected_delivery_date": now - timedelta(days=4),
                "actual_delivery_date": now - timedelta(days=5),  # Early delivery (on-time)
                "items": {"product": "Specialized Equipment", "unit_price": 1200.00, "category": "Electronics"},
                "quantity": 25,
                "status": "completed",
                "quality_rating": 4.8,
                "issue_date": now - timedelta(days=14),
                "acknowledgment_date": now - timedelta(days=12, hours=8),  # 40 hours: 14d to 12d-8h = 2d - 8h = 40h
            },
            {
                "vendor": vendor5,
                "po_number": "PO-ELITE-003",
                "order_date": now - timedelta(days=6),
                "expected_delivery_date": now + timedelta(days=9),
                "actual_delivery_date": None,
                "items": {"product": "Custom Components", "unit_price": 950.00, "category": "Electronics"},
                "quantity": 35,
                "status": "acknowledged",
                "quality_rating": None,
                "issue_date": now - timedelta(days=6),
                "acknowledgment_date": now - timedelta(days=4, hours=8),  # 40 hours: 6d to 4d-8h = 2d - 8h = 40h (avg = 40.0)
            },
            {
                "vendor": vendor5,
                "po_number": "PO-ELITE-004",
                "order_date": now - timedelta(days=2),
                "expected_delivery_date": now + timedelta(days=13),
                "actual_delivery_date": None,
                "items": {"product": "Advanced Systems", "unit_price": 1500.00, "category": "Electronics"},
                "quantity": 20,
                "status": "pending",
                "quality_rating": None,
                "issue_date": now - timedelta(days=2),
                "acknowledgment_date": None,
            },
        ])

        # Create all purchase orders
        created_pos = []
        for po_info in po_data:
            po = PurchaseOrder.objects.create(**po_info)
            created_pos.append(po)

        self.stdout.write(self.style.SUCCESS(f'\nCreated {len(created_pos)} purchase orders'))
        self.stdout.write(self.style.SUCCESS(f'Created {len(vendors)} vendors'))
        
        # Metrics will be automatically calculated by signals
        self.stdout.write(self.style.SUCCESS('\n✅ Test data created successfully!'))
        self.stdout.write('\n📊 Summary:')
        self.stdout.write(f'  - {len(vendors)} vendors created')
        self.stdout.write(f'  - {len(created_pos)} purchase orders created')
        self.stdout.write(f'  - Vendor metrics will be automatically calculated')
        self.stdout.write('\n🎯 You can now:')
        self.stdout.write('  1. View the dashboard to see charts and metrics')
        self.stdout.write('  2. Check vendors page to see performance metrics')
        self.stdout.write('  3. View purchase orders in various states')
        self.stdout.write('  4. Test acknowledging and completing POs')

