#!/bin/bash

# Get port from environment variable (Render requirement)
PORT=${PORT:-5000}
HOST=${HOST:-0.0.0.0}

echo "🚀 Starting Eco Collect application on $HOST:$PORT"

# Run database migrations (only if database is available)
echo "🔄 Running database migrations..."
cd /app && python -m flask db upgrade 2>/dev/null || echo "⚠️  Migration failed - database may not be available yet, continuing anyway..."

# Start the Flask application (serves both API and frontend)
echo "🚀 Starting Flask application on $HOST:$PORT"
cd /app && exec gunicorn --bind $HOST:$PORT --workers 2 --timeout 120 "app:create_app()" 