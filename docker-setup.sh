#!/bin/bash

# Docker Setup Script for Social Venture Web Application
# This script helps set up the Docker environment

set -e

echo "🐳 Setting up Docker environment for Social Venture Web Application"
echo "================================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# Flask Configuration
SECRET_KEY=your-secret-key-change-this-in-production
FLASK_ENV=development

# Database Configuration
DATABASE_URL=sqlite:///site.db

# Email Configuration (for sending OTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# OTP Configuration
OTP_TTL_SECONDS=300
OTP_LENGTH=6
EOF
    echo "✅ Created .env file"
    echo "⚠️  Please update the email configuration in .env file before starting"
else
    echo "✅ .env file already exists"
fi

# Build and start services
echo "🔨 Building and starting Docker services..."
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    
    # Initialize database if needed
    echo "🗄️  Initializing database..."
    docker-compose exec -T web flask db init 2>/dev/null || echo "Database already initialized"
    docker-compose exec -T web flask db migrate -m "Initial migration" 2>/dev/null || echo "Migration already exists"
    docker-compose exec -T web flask db upgrade
    
    echo ""
    echo "🎉 Setup complete! Your application is ready."
    echo ""
    echo "📱 Access your application:"
    echo "   Web Application: http://localhost:8000"
    echo "   Redis Commander: http://localhost:8081 (optional)"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs: docker-compose logs -f web"
    echo "   Stop services: docker-compose down"
    echo "   Restart web: docker-compose restart web"
    echo "   Redis CLI: docker-compose exec redis redis-cli"
    echo ""
    echo "⚠️  Remember to:"
    echo "   1. Update email settings in .env file"
    echo "   2. Test the OTP functionality"
    echo "   3. Configure production settings before deployment"
    
else
    echo "❌ Services failed to start. Check logs with:"
    echo "   docker-compose logs"
    exit 1
fi 