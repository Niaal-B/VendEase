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
            
            # Always write to stdout (not self.stdout) to ensure visibility in build logs
            print(f'[SEED] Checking database state: {vendor_count} vendors, {po_count} purchase orders')
            self.stdout.write(f'Checking database state: {vendor_count} vendors, {po_count} purchase orders')
            
            if vendor_count > 0 or po_count > 0:
                msg = f'Database already contains data ({vendor_count} vendors, {po_count} purchase orders). Skipping seed.'
                print(f'[SEED] WARNING: {msg}')
                self.stdout.write(self.style.WARNING(msg))
                return
            
            # Only seed if database is empty
            msg = 'Database is empty. Seeding initial data...'
            print(f'[SEED] {msg}')
            self.stdout.write(self.style.SUCCESS(msg))
            
            # Call the existing seed command
            call_command('seed_test_data', verbosity=options.get('verbosity', 1))
            
            msg = 'Initial data seeded successfully!'
            print(f'[SEED] SUCCESS: {msg}')
            self.stdout.write(self.style.SUCCESS(msg))
        except Exception as e:
            error_msg = f'Error seeding data: {str(e)}'
            print(f'[SEED] ERROR: {error_msg}')
            self.stdout.write(self.style.ERROR(error_msg))
            import traceback
            traceback.print_exc()
            self.stdout.write(traceback.format_exc())
            raise

