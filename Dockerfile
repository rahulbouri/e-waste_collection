# Multi-stage build for full-stack application
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend application
RUN npm run build

# Backend build stage
FROM python:3.11-slim AS backend-builder

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        libpq-dev \
        curl \
        postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create venv and install backend requirements (including gunicorn)
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt && pip install gunicorn

# Copy backend code
COPY backend/ .

# Production stage
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nginx \
        gcc \
        g++ \
        libpq-dev \
        curl \
        postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy backend code and venv from backend-builder
COPY --from=backend-builder /app /app/backend
COPY --from=backend-builder /venv /venv

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app/backend' >> /start.sh && \
    echo '/venv/bin/gunicorn --bind 127.0.0.1:5000 --workers 2 "app:create_app()" &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start the application
CMD ["/start.sh"] 