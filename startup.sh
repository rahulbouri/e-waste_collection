#!/bin/bash

# Get port from environment variable (Render requirement)
PORT=${PORT:-5000}
HOST=${HOST:-0.0.0.0}

echo "🚀 Starting Eco Collect application on $HOST:$PORT"

# Start nginx in background (only if not on Render)
if [ "$RENDER" != "true" ]; then
    echo "📦 Starting nginx for local development..."
    nginx &
    sleep 2
fi

# Run database migrations
echo "🔄 Running database migrations..."
python -m flask db upgrade || true

# Start the Flask application
echo "🚀 Starting Flask application on $HOST:$PORT"
exec gunicorn --bind $HOST:$PORT --workers 2 --timeout 120 "app:create_app()" 