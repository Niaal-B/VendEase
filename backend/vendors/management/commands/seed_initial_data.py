from django.core.management.base import BaseCommand
from vendors.models import Vendor
from purchase_orders.models import PurchaseOrder


class Command(BaseCommand):
    help = 'Seed initial data only if database is empty (preserves existing data)'

    def handle(self, *args, **options):
        # Check if data already exists
        if Vendor.objects.exists() or PurchaseOrder.objects.exists():
            self.stdout.write(self.style.WARNING(
                'Database already contains data. Skipping seed to preserve existing data.'
            ))
            return
        
        # Only seed if database is empty
        self.stdout.write('Database is empty. Seeding initial data...')
        
        # Call the existing seed command
        from django.core.management import call_command
        call_command('seed_test_data')
        
        self.stdout.write(self.style.SUCCESS('Initial data seeded successfully!'))

