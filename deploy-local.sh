#!/bin/bash

# Eco Collect Society Aid - Local Deployment Script
# This script automates the local deployment process

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port" >/dev/null 2>&1 || nc -z localhost $port >/dev/null 2>&1; then
            print_success "$service is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Function to check Docker status
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
        else
            print_error "env.example file not found"
            exit 1
        fi
    else
        print_warning ".env file already exists"
    fi
    
    # Generate secret key if not set
    if ! grep -q "SECRET_KEY=" .env || grep -q "SECRET_KEY=your-secret-key-here" .env; then
        SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || echo "dev-secret-key-change-in-production")
        sed -i.bak "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
        print_success "Generated new SECRET_KEY"
    fi
}

# Function to build and start services
build_and_start() {
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    print_status "Starting services..."
    docker-compose up -d postgres redis
    
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Wait for postgres
    if ! wait_for_service "PostgreSQL" 5432; then
        print_error "PostgreSQL failed to start"
        docker-compose logs postgres
        exit 1
    fi
    
    print_status "Starting backend (with automatic migrations)..."
    docker-compose up -d backend
    
    # Wait for backend to complete migrations
    print_status "Waiting for backend to complete migrations..."
    sleep 15
    
    print_status "Starting frontend..."
    docker-compose up -d frontend
    
    print_status "Starting Redis Commander..."
    docker-compose up -d redis-commander
}

# Function to verify database setup
verify_database() {
    print_status "Verifying database setup..."
    
    # Wait a bit more for backend to complete migrations
    sleep 10
    
    # Check if backend is healthy
    if curl -s http://localhost:8000/api/health >/dev/null; then
        print_success "Backend is healthy and migrations completed"
    else
        print_warning "Backend health check failed, checking logs..."
        docker-compose logs backend --tail=20
    fi
    
    # Verify tables exist
    local table_count=$(PGPASSWORD=${POSTGRES_PASSWORD:-airflow} docker-compose exec -T postgres psql -U postgres -d waste_collection -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    if [ "$table_count" -ge 4 ]; then
        print_success "Database tables verified ($table_count tables found)"
    else
        print_warning "Expected 4+ tables, found $table_count. Checking migration status..."
        docker-compose exec -T backend alembic current
    fi
}

# Function to check services
check_services() {
    print_status "Checking service status..."
    
    # Check if all services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "All services are running"
    else
        print_error "Some services failed to start"
        docker-compose ps
        exit 1
    fi
    
    # Test backend health
    if curl -s http://localhost:8000/api/health >/dev/null; then
        print_success "Backend API is responding"
    else
        print_warning "Backend API health check failed"
    fi
    
    # Test frontend
    if curl -s http://localhost:5173 >/dev/null; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend accessibility check failed"
    fi
}

# Function to show access information
show_access_info() {
    echo
    print_success "🎉 Deployment completed successfully!"
    echo
    echo "Access your application at:"
    echo "  🌐 Frontend:     http://localhost:5173"
    echo "  🔧 Backend API:  http://localhost:8000"
    echo "  ❤️  Health Check: http://localhost:8000/api/health"
    echo "  📊 Redis Admin:  http://localhost:8081"
    echo
    echo "Useful commands:"
    echo "  📋 View logs:    docker-compose logs -f"
    echo "  🛑 Stop:         docker-compose down"
    echo "  🔄 Restart:      docker-compose restart"
    echo "  🧹 Clean up:     docker-compose down -v"
    echo
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    docker-compose down
}

# Main deployment process
main() {
    echo "🚀 Eco Collect Society Aid - Local Deployment"
    echo "=============================================="
    echo
    
    # Check prerequisites
    check_docker
    
    # Setup environment
    setup_environment
    
    # Stop any existing containers
    print_status "Stopping any existing containers..."
    docker-compose down 2>/dev/null || true
    
    # Build and start services
    build_and_start
    
    # Verify database setup
    verify_database
    
    # Check services
    check_services
    
    # Show access information
    show_access_info
    
    # Set up signal handler for cleanup
    trap cleanup EXIT
    
    print_status "Deployment completed! Press Ctrl+C to stop all services."
    
    # Keep script running and show logs
    docker-compose logs -f
}

# Handle command line arguments
case "${1:-}" in
    "stop")
        print_status "Stopping all services..."
        docker-compose down
        print_success "All services stopped"
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose restart
        print_success "All services restarted"
        ;;
    "logs")
        print_status "Showing logs..."
        docker-compose logs -f
        ;;
    "status")
        print_status "Service status:"
        docker-compose ps
        ;;
    "clean")
        print_status "Cleaning up (removing volumes)..."
        docker-compose down -v
        print_success "Cleanup completed"
        ;;
    "up")
        print_status "Starting services with automatic migrations..."
        docker-compose up -d
        print_success "Services started. Backend will automatically run migrations."
        ;;
    "build")
        print_status "Building images with no cache..."
        docker-compose build --no-cache
        print_success "Images built successfully"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "  (no args)  Deploy the application"
        echo "  up         Start services (migrations run automatically)"
        echo "  build      Build images with no cache"
        echo "  stop       Stop all services"
        echo "  restart    Restart all services"
        echo "  logs       Show logs"
        echo "  status     Show service status"
        echo "  clean      Stop and remove volumes"
        echo "  help       Show this help"
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac 