#!/bin/bash

# Wait for a moment to ensure the database file is ready
sleep 2

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the Flask application
echo "Starting Flask application..."
exec gunicorn --bind 0.0.0.0:5000 --workers 1 --timeout 120 "app:create_app()" 