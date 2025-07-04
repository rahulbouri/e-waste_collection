# Deployment Guide

This guide covers deploying the Eco Collect Society Aid application to production environments.

## 🏗️ Architecture Overview

The application consists of:
- **Frontend**: React + TypeScript + Vite (served by Nginx)
- **Backend**: Flask + Python (served by Gunicorn)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Email**: SMTP (Gmail)

## 🚀 Local Development

### Prerequisites
- Docker & Docker Compose
- Git

### Quick Start
```bash
# Clone the repository
git clone <your-repo-url>
cd eco-collect-society-aid

# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env

# Start development environment
./deploy-dev.sh
```

### Development URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Database: localhost:5432
- Redis: localhost:6379

## 🏭 Production Deployment

### Option 1: Render (Recommended)

Render is a modern cloud platform that offers easy deployment with automatic scaling.

#### Step 1: Prepare Your Repository
1. Ensure your repository is on GitHub/GitLab
2. Add the following files to your repository:
   - `docker-compose.prod.yml`
   - `backend/Dockerfile.prod`
   - `Dockerfile.frontend.prod`
   - `nginx.conf`
   - `env.production.example`

#### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub/GitLab account
3. Create a new account

#### Step 3: Deploy Backend Service
1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   ```
   Name: eco-collect-backend
   Environment: Docker
   Branch: main
   Root Directory: ./
   Build Command: docker build -f backend/Dockerfile.prod -t backend ./backend
   Start Command: docker run -p 10000:5000 backend
   ```

4. Add environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   REDIS_URL=redis://host:6379/0
   SECRET_KEY=your-secret-key
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=465
   MAIL_USE_SSL=true
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_DEFAULT_SENDER=your-email@gmail.com
   FLASK_ENV=production
   ```

5. Click "Create Web Service"

#### Step 4: Create PostgreSQL Database
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Configure:
   ```
   Name: eco-collect-db
   Database: waste_collection
   User: postgres
   ```
3. Copy the external database URL
4. Update your backend service's `DATABASE_URL` environment variable

#### Step 5: Create Redis Instance
1. In Render dashboard, click "New +" → "Redis"
2. Configure:
   ```
   Name: eco-collect-redis
   ```
3. Copy the external Redis URL
4. Update your backend service's `REDIS_URL` environment variable

#### Step 6: Deploy Frontend Service
1. In Render dashboard, click "New +" → "Static Site"
2. Configure:
   ```
   Name: eco-collect-frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-service.onrender.com/api
   ```

4. Click "Create Static Site"

#### Step 7: Configure Custom Domain (Optional)
1. In your frontend service settings, add a custom domain
2. Update your backend CORS settings to allow your domain
3. Update `VITE_API_URL` to use your custom domain

### Option 2: Railway

Railway is another excellent platform for containerized applications.

#### Step 1: Prepare Your Repository
Same as Render preparation.

#### Step 2: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account

#### Step 3: Deploy Backend
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repository
3. Railway will auto-detect the Docker setup
4. Add environment variables (same as Render)
5. Deploy

#### Step 4: Add PostgreSQL
1. In your project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically connect it to your backend
3. Update environment variables with the new database URL

#### Step 5: Add Redis
1. In your project, click "New" → "Database" → "Redis"
2. Railway will automatically connect it to your backend
3. Update environment variables with the new Redis URL

#### Step 6: Deploy Frontend
1. Create a new project for frontend
2. Connect the same repository
3. Configure build settings for frontend
4. Add environment variables
5. Deploy

## 🔧 Environment Variables

### Required Variables
```bash
# Database
POSTGRES_DB=waste_collection
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Redis
REDIS_URL=redis://host:6379/0

# Flask
SECRET_KEY=your-very-secure-secret-key
FLASK_ENV=production

# Email (Gmail example)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=465
MAIL_USE_SSL=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# Frontend
VITE_API_URL=https://your-backend-url.com/api
```

### Gmail App Password Setup
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password for "Mail"
4. Use this password in `MAIL_PASSWORD`

## 🐳 Docker Commands

### Development
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose build && docker-compose up -d
```

### Production
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache
```

## 🔍 Monitoring & Debugging

### Health Checks
- Backend: `GET /api/health`
- Frontend: `GET /`
- Database: PostgreSQL connection
- Redis: Redis ping

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Management
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d waste_collection

# Run migrations
docker-compose exec backend flask db upgrade
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Use strong, unique passwords
- [ ] Enable HTTPS (automatic on Render/Railway)
- [ ] Set secure `SECRET_KEY`
- [ ] Configure CORS properly
- [ ] Use environment variables for all secrets
- [ ] Enable database backups
- [ ] Set up monitoring and alerts

### Security Headers
The nginx configuration includes security headers:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy

## 📊 Performance Optimization

### Frontend
- Static assets cached for 1 year
- Gzip compression enabled
- Optimized bundle size with Vite

### Backend
- Gunicorn with multiple workers
- Redis caching for OTP
- Database connection pooling
- Health checks for all services

## 🚨 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure `VITE_API_URL` is correct
- Check backend CORS configuration
- Verify domain is allowed in CORS settings

#### Database Connection Issues
- Check `DATABASE_URL` format
- Verify database credentials
- Ensure database is running and accessible

#### Email Not Sending
- Verify Gmail app password
- Check SMTP settings
- Ensure `MAIL_USERNAME` and `MAIL_PASSWORD` are correct

#### Build Failures
- Check Dockerfile syntax
- Verify all required files are present
- Check for missing dependencies

### Debug Commands
   ```bash
# Check container status
docker-compose ps

# Check container logs
docker-compose logs [service-name]

# Access container shell
docker-compose exec [service-name] sh

# Check network connectivity
docker-compose exec backend ping postgres
docker-compose exec backend ping redis
```

## 📞 Support

For deployment issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Test locally first
4. Check platform-specific documentation (Render/Railway)

## 🔄 Updates & Maintenance

### Updating the Application
1. Push changes to your repository
2. Platform will automatically rebuild and deploy
3. Monitor logs for any issues
4. Test the application after deployment

### Database Migrations
```bash
# Run migrations
docker-compose exec backend flask db upgrade

# Create new migration
docker-compose exec backend flask db migrate -m "Description"
```

### Backup Strategy
- Enable automatic backups on your database service
- Test restore procedures regularly
- Keep multiple backup copies 