#!/bin/bash

# Development Deployment Script
set -e

echo "🚀 Starting development deployment..."

# Check if .env file exists, create from example if not
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env 2>/dev/null || echo "⚠️  No env.example found, please create .env manually"
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build development images
echo "🔨 Building development images..."
docker-compose build

# Start development services
echo "🚀 Starting development services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

echo "✅ Development deployment completed!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 Database: PostgreSQL on localhost:5432"
echo "🗄️  Cache: Redis on localhost:6379"

echo ""
echo "📝 To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "📝 To stop services:"
echo "  docker-compose down"
echo ""
echo "📝 To rebuild after changes:"
echo "  docker-compose build && docker-compose up -d" 