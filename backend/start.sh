#!/bin/bash

# Eco Collect Backend Startup Script
# This script ensures database migrations are applied before starting the application

set -e

# Set PostgreSQL password for psql commands
export PGPASSWORD="${POSTGRES_PASSWORD:-airflow}"

echo "🚀 Starting Eco Collect Backend..."

# Function to wait for database
wait_for_database() {
    echo "⏳ Waiting for database to be ready..."
    until pg_isready -h postgres -U postgres -d waste_collection; do
        echo "Database not ready, waiting..."
        sleep 2
    done
    echo "✅ Database is ready!"
}

# Function to run migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    
    # Check if alembic_version table exists
    if ! psql -h postgres -U postgres -d waste_collection -c "SELECT 1 FROM alembic_version LIMIT 1;" >/dev/null 2>&1; then
        echo "📝 No alembic_version table found, initializing database..."
        
        # Check if any tables exist
        table_count=$(psql -h postgres -U postgres -d waste_collection -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name != 'alembic_version';" | tr -d ' ')
        
        if [ "$table_count" -gt 0 ]; then
            echo "⚠️  Database has tables but no alembic_version. Stamping current revision..."
            alembic stamp head
        else
            echo "📝 Database is empty, applying existing migration..."
            # Don't create new migration, just apply the existing one
        fi
    fi
    
    # Apply migrations
    echo "🔄 Applying migrations..."
    alembic upgrade head
    echo "✅ Migrations completed!"
}

# Function to start the application
start_application() {
    echo "🚀 Starting Flask application..."
    exec gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 "app:create_app()"
}

# Main execution
main() {
    # Wait for database
    wait_for_database
    
    # Run migrations
    run_migrations
    
    # Start application
    start_application
}

# Run main function
main 