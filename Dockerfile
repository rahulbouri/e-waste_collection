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
RUN pip install --upgrade pip && pip install -r requirements.txt && pip install gunicorn supervisor

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
        supervisor \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy backend code and venv from backend-builder
COPY --from=backend-builder /app /app/backend
COPY --from=backend-builder /venv /venv

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Run database migrations before starting services
RUN /venv/bin/alembic upgrade head || true

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start supervisord to run both nginx and gunicorn
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 