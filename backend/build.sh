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
echo "=== Starting data seeding process ==="
python manage.py seed_initial_data --verbosity 2 2>&1 || {
    echo "Warning: Data seeding command exited with non-zero status"
    echo "This is okay if database already has data"
}
echo "=== Data seeding process completed ==="
