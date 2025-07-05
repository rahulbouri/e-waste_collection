#!/bin/bash

# Render Deployment Script
set -e

echo "🚀 Starting Render deployment preparation..."

# Check if .env file exists, create from example if not
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env 2>/dev/null || echo "⚠️  No env.example found, please create .env manually"
fi

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t eco-collect-app .

echo "✅ Docker image built successfully!"
echo ""
echo "📝 For Render deployment:"
echo "1. Push this code to your Git repository"
echo "2. Connect your repository to Render"
echo "3. Set the following environment variables in Render:"
echo ""
echo "Required Environment Variables:"
echo "  - SECRET_KEY (generate a strong secret key)"
echo "  - DATABASE_URL (your PostgreSQL connection string)"
echo "  - REDIS_URL (your Redis connection string)"
echo "  - MAIL_USERNAME (your email)"
echo "  - MAIL_PASSWORD (your email app password)"
echo "  - MAIL_DEFAULT_SENDER (your email)"
echo ""
echo "Optional Environment Variables:"
echo "  - MAIL_SERVER (default: smtp.gmail.com)"
echo "  - MAIL_PORT (default: 587)"
echo "  - MAIL_USE_TLS (default: True)"
echo "  - MAIL_USE_SSL (default: False)"
echo "  - OTP_TTL_SECONDS (default: 300)"
echo "  - OTP_LENGTH (default: 6)"
echo ""
echo "📝 Render Configuration:"
echo "  - Build Command: (leave empty - uses Dockerfile)"
echo "  - Start Command: (leave empty - uses Dockerfile CMD)"
echo "  - Port: 80"
echo ""
echo "🌐 Your app will be available at: https://your-app-name.onrender.com" 