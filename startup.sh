#!/bin/bash

# Get port from environment variable (Render requirement)
PORT=${PORT:-5000}
HOST=${HOST:-0.0.0.0}

echo "🚀 Starting Eco Collect application on $HOST:$PORT"

# Start nginx in background (always start nginx for production)
echo "📦 Starting nginx..."
nginx &
sleep 2

# Run database migrations
echo "🔄 Running database migrations..."
cd /app && python -m flask db upgrade 2>/dev/null || echo "⚠️  Migration failed, continuing anyway..."

# Start the Flask application
echo "🚀 Starting Flask application on $HOST:$PORT"
cd /app && exec gunicorn --bind $HOST:$PORT --workers 2 --timeout 120 "app:create_app()" 