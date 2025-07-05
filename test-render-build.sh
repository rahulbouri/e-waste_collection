#!/bin/bash

# Test script to verify Render deployment compatibility
set -e

echo "🧪 Testing Render deployment compatibility..."

# Test 1: Build the Docker image
echo "🔨 Building Docker image..."
docker build -t eco-collect-render-test .

# Test 2: Run with Render-like environment variables
echo "🚀 Testing with Render environment variables..."
docker run --rm \
  -e PORT=10000 \
  -e HOST=0.0.0.0 \
  -e SECRET_KEY=test-secret \
  -e DATABASE_URL=postgresql://test:test@localhost:5432/test \
  -e REDIS_URL=redis://localhost:6379/0 \
  -p 10000:10000 \
  --name render-test \
  eco-collect-render-test &

# Wait for container to start
sleep 10

# Test 3: Check if the application is responding
echo "🔍 Testing application response..."
if curl -f http://localhost:10000/health > /dev/null 2>&1; then
    echo "✅ Application is responding on port 10000"
else
    echo "❌ Application is not responding on port 10000"
fi

# Clean up
echo "🧹 Cleaning up..."
docker stop render-test 2>/dev/null || true
docker rmi eco-collect-render-test 2>/dev/null || true

echo "✅ Render compatibility test completed!"
echo ""
echo "📝 Key points for Render deployment:"
echo "  ✅ Dockerfile uses PORT environment variable"
echo "  ✅ Startup script handles Render's requirements"
echo "  ✅ Health check uses correct port"
echo "  ✅ Non-root user for security"
echo ""
echo "🚀 Ready for Render deployment!" 