#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Create superuser if environment variables are set
if [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    python manage.py create_admin || true
fi

