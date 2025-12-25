from django.core.management.base import BaseCommand
from django.core.management import call_command
from vendors.models import Vendor
from purchase_orders.models import PurchaseOrder


class Command(BaseCommand):
    help = 'Seed initial data only if database is empty (preserves existing data)'

    def handle(self, *args, **options):
        try:
            # Check if data already exists
            vendor_count = Vendor.objects.count()
            po_count = PurchaseOrder.objects.count()
            
            self.stdout.write(f'Checking database state: {vendor_count} vendors, {po_count} purchase orders')
            
            if vendor_count > 0 or po_count > 0:
                self.stdout.write(self.style.WARNING(
                    f'Database already contains data ({vendor_count} vendors, {po_count} purchase orders). '
                    'Skipping seed to preserve existing data.'
                ))
                return
            
            # Only seed if database is empty
            self.stdout.write(self.style.SUCCESS('Database is empty. Seeding initial data...'))
            
            # Call the existing seed command
            call_command('seed_test_data', verbosity=options.get('verbosity', 1))
            
            self.stdout.write(self.style.SUCCESS('Initial data seeded successfully!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error seeding data: {str(e)}'))
            import traceback
            self.stdout.write(traceback.format_exc())
            raise

