#!/bin/bash

# Production Deployment Script
set -e

echo "🚀 Starting production deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy env.production.example to .env and configure your environment variables."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("POSTGRES_PASSWORD" "SECRET_KEY" "MAIL_USERNAME" "MAIL_PASSWORD" "MAIL_DEFAULT_SENDER")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env file!"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build production images
echo "🔨 Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start production services
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Production deployment completed!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 Database: PostgreSQL on localhost:5432"
echo "🗄️  Cache: Redis on localhost:6379"

echo ""
echo "📝 To view logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "📝 To stop services:"
echo "  docker-compose -f docker-compose.prod.yml down" 