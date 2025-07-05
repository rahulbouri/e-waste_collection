# Eco Collect Society Aid

A comprehensive waste collection management system with user authentication, booking management, and real-time notifications.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Flask + Python + SQLAlchemy
- **Database**: PostgreSQL
- **Cache**: Redis
- **Email**: SMTP (Gmail)
- **Deployment**: Docker + Docker Compose

## 🚀 Quick Start

### Development Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd eco-collect-society-aid

# Copy environment file
cp env.example .env

# Edit environment variables
nano .env

# Start development environment
./deploy-dev.sh
```

**Development URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Database: localhost:5432
- Redis: localhost:6379

### Production Environment

```bash
# Copy production environment file
cp env.production.example .env

# Edit production environment variables
nano .env

# Deploy to production
./deploy-prod.sh
```

**Production URLs:**
- Frontend: http://localhost
- Backend API: http://localhost:8000

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

## 📋 Features

### User Management
- Email-based authentication with OTP
- User profile management
- Session management with Redis

### Booking System
- E-waste and biomedical waste booking
- Image upload support
- Pickup scheduling
- Booking status tracking

### Admin Features
- Booking management
- User management
- Email notifications
- Dashboard analytics

### Technical Features
- Responsive design
- Real-time updates
- Email notifications
- Image processing
- CORS support
- Health monitoring

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
POSTGRES_DB=waste_collection
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Redis
REDIS_URL=redis://redis:6379/0

# Flask
SECRET_KEY=your_secret_key
FLASK_ENV=development

# Email (Gmail)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=465
MAIL_USE_SSL=true
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com

# Frontend
VITE_API_URL=http://localhost:8000/api
```

### Gmail Setup
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password in `MAIL_PASSWORD`

## 📁 Project Structure

```
eco-collect-society-aid/
├── backend/                 # Flask backend
│   ├── app/                # Application code
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities
│   │   └── models.py       # Database models
│   ├── migrations/         # Database migrations
│   ├── Dockerfile          # Development Dockerfile
│   ├── Dockerfile.prod     # Production Dockerfile
│   └── requirements.txt    # Python dependencies
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── routes/         # React routes
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── lib/           # Utilities and API
│   ├── public/             # Static assets
│   ├── docker-compose.yml  # Development compose
│   ├── docker-compose.prod.yml # Production compose
│   ├── Dockerfile.frontend # Development frontend
│   └── Dockerfile.frontend.prod # Production frontend
├── nginx.conf             # Nginx configuration
└── README.md              # This file
```

## 🚀 Deployment

### Local Development
- Uses Docker Compose with volume mounts for hot reloading
- Development-specific configurations
- Debug logging enabled

### Production
- Optimized Docker images
- Nginx for static file serving
- Gunicorn for backend
- Health checks and monitoring
- Security headers and optimizations

### Cloud Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to:
- Render
- Railway
- Heroku
- DigitalOcean

## 🔍 Monitoring

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

## 🛠️ Development

### Adding New Features
1. Create feature branch
2. Make changes
3. Test locally
4. Update documentation
5. Create pull request

### Database Migrations
```bash
# Create migration
docker-compose exec backend flask db migrate -m "Description"

# Apply migrations
docker-compose exec backend flask db upgrade
```

### API Testing
```bash
# Health check
curl http://localhost:8000/api/health

# Send OTP
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 🔒 Security

### Production Checklist
- [ ] Use strong, unique passwords
- [ ] Enable HTTPS
- [ ] Set secure `SECRET_KEY`
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable database backups
- [ ] Set up monitoring and alerts

### Security Features
- CORS protection
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Input validation

## 📊 Performance

### Frontend Optimizations
- Code splitting
- Lazy loading
- Image optimization
- Gzip compression
- Browser caching

### Backend Optimizations
- Database connection pooling
- Redis caching
- Gunicorn workers
- Query optimization
- Response compression

## 🚨 Troubleshooting

### Common Issues

#### CORS Errors
- API URL is now auto-detected
- Verify backend CORS settings
- Ensure proper domain configuration

#### Database Issues
- Check database connection
- Verify credentials
- Run migrations if needed

#### Email Issues
- Verify Gmail app password
- Check SMTP settings
- Test email configuration

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

For issues and questions:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Test locally first
4. Check [DEPLOYMENT.md](DEPLOYMENT.md) for platform-specific help

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📈 Roadmap

- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Payment integration
- [ ] IoT integration
