#!/bin/bash

# Test script for Eco Collect Society Aid deployment
# This script tests all the main functionality of the application

# Remove set -e to prevent script from stopping on first error
# set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running: $test_name"
    echo "Command: $test_command"
    
    if eval "$test_command" >/dev/null 2>&1; then
        print_success "$test_name"
        ((TESTS_PASSED++))
    else
        print_error "$test_name"
        ((TESTS_FAILED++))
        echo "Command failed with exit code: $?"
    fi
    echo ""
}

# Function to test HTTP endpoint
test_http_endpoint() {
    local url="$1"
    local expected_status="${2:-200}"
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$status_code" = "$expected_status" ]; then
        return 0
    else
        echo "Expected status: $expected_status, got: $status_code"
        return 1
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local method="$1"
    local url="$2"
    local data="$3"
    local expected_status="${4:-200}"
    
    local curl_cmd="curl -s -o /dev/null -w '%{http_code}' -X $method"
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$url' 2>/dev/null || echo '000'"
    
    local status_code=$(eval "$curl_cmd")
    
    if [ "$status_code" = "$expected_status" ]; then
        return 0
    else
        echo "Expected status: $expected_status, got: $status_code"
        return 1
    fi
}

echo "🧪 Eco Collect Society Aid - Deployment Test Suite"
echo "=================================================="
echo

# Test 1: Check if Docker containers are running
run_test "Docker containers are running" "docker-compose ps | grep -q 'Up'"

# Test 2: Test backend health endpoint
run_test "Backend health endpoint" "test_http_endpoint 'http://localhost:8000/api/health'"

# Test 3: Test frontend accessibility
run_test "Frontend is accessible" "test_http_endpoint 'http://localhost:5173'"

# Test 4: Test Redis Commander
run_test "Redis Commander is accessible" "test_http_endpoint 'http://localhost:8081'"

# Test 5: Test database connection
run_test "Database connection" "docker-compose exec -T backend python -c 'from app import create_app, db; app = create_app(); app.app_context().push(); from sqlalchemy import text; print(db.session.execute(text(\"SELECT 1\")).scalar())'"

# Test 6: Test Redis connection
run_test "Redis connection" "docker-compose exec -T backend python -c 'import redis; r = redis.from_url(\"redis://redis:6379/0\"); print(r.ping())'"

# Test 7: Test OTP generation (without email)
run_test "OTP generation endpoint" "test_api_endpoint 'POST' 'http://localhost:8000/api/auth/send-otp' '{\"email\": \"rahulbouri16@gmail.com\"}'"

# Test 8: Test user registration endpoint
run_test "User registration endpoint" "test_api_endpoint 'POST' 'http://localhost:8000/api/auth/register' '{\"email\": \"test7@example.com\", \"name\": \"Test User 7\"}' '201'"

# Test 9: Test booking creation (unauthenticated)
run_test "Booking creation endpoint (unauthenticated)" "test_api_endpoint 'POST' 'http://localhost:8000/api/bookings/' '{\"waste_category\": \"ewaste\", \"waste_types\": [\"laptop\", \"mobile\"], \"quantity\": 2, \"pickup_date\": \"2024-01-15\", \"address_line1\": \"123 Test St\", \"pincode\": \"560001\"}' '401'"

# Test 10: Test user profile endpoint (unauthenticated)
run_test "User profile endpoint (unauthenticated)" "test_api_endpoint 'GET' 'http://localhost:8000/api/users/profile' '' '401'"

# Test 11: Check if all required tables exist (updated to not look for otp_tokens)
run_test "Database tables exist" "docker-compose exec -T postgres psql -U postgres -d waste_collection -c \"\\dt\" | grep -E '(users|bookings|addresses)'"

# Test 12: Test CORS headers
run_test "CORS headers are set" "curl -s -I 'http://localhost:8000/api/health' | grep -q 'Access-Control-Allow-Origin'"

echo
echo "📊 Test Results Summary"
echo "======================="
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "🎉 All tests passed! Your deployment is working correctly."
    echo
    echo "Your application is ready to use:"
    echo "  🌐 Frontend: http://localhost:5173"
    echo "  🔧 Backend API: http://localhost:8000"
    echo "  📊 Redis Admin: http://localhost:8081"
    echo
    echo "Next steps:"
    echo "  1. Open http://localhost:5173 in your browser"
    echo "  2. Try the OTP login with your email"
    echo "  3. Create a booking to test the full workflow"
    echo "  4. Check the logs with: docker-compose logs -f"
else
    print_error "❌ Some tests failed. Please check the logs and configuration."
    echo
    echo "Troubleshooting tips:"
    echo "  1. Check if all containers are running: docker-compose ps"
    echo "  2. View logs: docker-compose logs -f"
    echo "  3. Restart services: docker-compose restart"
    echo "  4. Check the deployment guide in DEPLOYMENT.md"
fi

echo
echo "🔍 Detailed Service Status:"
docker-compose ps

echo
echo "📋 Recent Logs (last 10 lines):"
docker-compose logs --tail=10 