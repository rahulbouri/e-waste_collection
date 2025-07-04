#!/bin/bash

# Setup script for Waste Collection Service Backend
set -e

echo "🚀 Setting up Waste Collection Service Backend..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp env.example .env
    print_warning "Please edit .env file with your email configuration before starting services."
else
    print_success ".env file already exists"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/migrations/versions
mkdir -p backend/scripts

# Make scripts executable
chmod +x backend/scripts/init_db.py
chmod +x backend/run.py

print_success "Directory structure created"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker Compose is available"

# Build and start services
print_status "Building and starting Docker services..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_success "Services are running successfully!"
    
    # Initialize database
    print_status "Initializing database..."
    if docker-compose exec -T backend alembic upgrade head 2>/dev/null; then
        print_success "Database migrations completed successfully!"
    else
        print_warning "Database migration failed, trying manual initialization..."
        docker-compose exec -T backend python scripts/init_db.py
        print_success "Database initialized manually!"
    fi
    
    echo ""
    echo "🎉 Setup complete! Your application is ready."
    echo ""
    echo "📱 Access your application:"
    echo "   API: http://localhost:5000"
    echo "   Health Check: http://localhost:5000/health"
    echo "   Redis Commander: http://localhost:8081 (optional)"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs: docker-compose logs -f backend"
    echo "   Stop services: docker-compose down"
    echo "   Restart backend: docker-compose restart backend"
    echo "   Database shell: docker-compose exec postgres psql -U postgres -d waste_collection"
    echo "   Redis CLI: docker-compose exec redis redis-cli"
    echo ""
    print_warning "Remember to:"
    echo "   1. Update email settings in .env file"
    echo "   2. Test the OTP functionality"
    echo "   3. Configure production settings before deployment"
    
else
    print_error "Services failed to start. Check logs with:"
    echo "   docker-compose logs"
    exit 1
fi 