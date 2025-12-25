#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Create superuser if environment variables are set
if [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    python manage.py create_admin || true
fi

# Seed initial data only if database is empty (won't overwrite existing data)
echo ""
echo "=========================================="
echo "STARTING DATA SEEDING PROCESS"
echo "=========================================="
set +o errexit  # Don't exit on error for seeding
python manage.py seed_initial_data --verbosity 2
SEED_EXIT_CODE=$?
set -o errexit  # Re-enable exit on error

echo ""
if [ $SEED_EXIT_CODE -eq 0 ]; then
    echo "=========================================="
    echo "DATA SEEDING COMPLETED SUCCESSFULLY"
    echo "=========================================="
else
    echo "=========================================="
    echo "DATA SEEDING SKIPPED OR FAILED"
    echo "Exit code: $SEED_EXIT_CODE"
    echo "This is normal if database already contains data"
    echo "=========================================="
fi
echo ""
