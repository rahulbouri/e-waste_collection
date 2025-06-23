# Venture - Email OTP Login Web Application

## 🚀 Project Overview

Venture is a modern web application built with Flask that provides a secure email-based OTP (One-Time Password) authentication system. The application features user management, address tracking, and order scheduling capabilities, all containerized with Docker for easy deployment and development.

## ✨ Key Features

- **🔐 Secure Email OTP Authentication** - 5-minute TTL session-based OTP system
- **👤 User Management** - Complete user lifecycle with name and email tracking
- **🏠 Address Management** - Multi-version address tracking with history
- **📦 Order Scheduling** - Pickup scheduling with image uploads
- **🐳 Docker Containerized** - Complete containerized environment with Redis
- **📊 Dashboard Interface** - User-friendly dashboard with order history
- **🔄 Database Migrations** - Alembic-based database schema management

## 🏗️ Architecture Overview

### Backend Infrastructure

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flask Web     │    │   Redis Cache   │    │   SQLite DB     │
│   Application   │◄──►│   (OTP/Session) │    │   (User Data)   │
│   (Port 8000)   │    │   (Port 6379)   │    │   (/app/site.db)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Backend Framework**: Flask (Python 3.10)
- **Database**: SQLite with SQLAlchemy ORM
- **Cache/Session**: Redis
- **Email Service**: SMTP (Gmail/SendGrid compatible)
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Alembic
- **Web Server**: Gunicorn
- **Frontend**: HTML5, CSS3, JavaScript

## 📁 Project Structure

```
venture/
├── app/                          # Main Flask application
│   ├── __init__.py              # Flask app factory & configuration
│   ├── models.py                # SQLAlchemy database models
│   ├── routes.py                # Flask routes & business logic
│   ├── templates/               # HTML templates
│   │   ├── index.html           # Landing page
│   │   ├── login.html           # OTP login page
│   │   ├── dashboard.html       # User dashboard
│   │   ├── address_form.html    # New user address form
│   │   ├── update_address.html  # Address update form
│   │   └── schedule_pickup.html # Pickup scheduling form
│   ├── static/
│   │   └── css/
│   │       └── styles.css       # Application styles
│   └── utils/                   # Utility modules
│       ├── config.py            # Configuration management
│       ├── emailer.py           # Email sending functionality
│       └── otp.py               # OTP generation & verification
├── migrations/                  # Database migrations
│   ├── env.py                   # Alembic environment
│   ├── script.py.mako           # Migration template
│   └── versions/                # Migration files
├── docker-compose.yml           # Docker services orchestration
├── Dockerfile                   # Web application container
├── requirements.txt             # Python dependencies
├── startup.sh                   # Container startup script
├── alembic.ini                  # Alembic configuration
└── README.md                    # This documentation
```

## 🗄️ Database Schema

### User Table
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(120),
    last_submitted_form_data JSON,
    created_at DATETIME NOT NULL,
    last_login_at DATETIME
);
```

### Address Table
```sql
CREATE TABLE address (
    address_id INTEGER PRIMARY KEY,
    user_email VARCHAR(120) REFERENCES user(email),
    google_maps VARCHAR(2083),
    address VARCHAR(500) NOT NULL,
    postal_code VARCHAR(6),
    city VARCHAR(20),
    state VARCHAR(20),
    last_address INTEGER REFERENCES address(address_id)
);
```

### Order Table
```sql
CREATE TABLE order (
    order_id INTEGER PRIMARY KEY,
    date DATETIME NOT NULL,
    user_email VARCHAR(120) REFERENCES user(email),
    address_id INTEGER REFERENCES address(address_id),
    contact_number VARCHAR(10) NOT NULL,
    description TEXT,
    images JSON
);
```

## 🔄 User Flow

### New User Journey
1. **Landing Page** → User visits the application
2. **Login Page** → User enters email address
3. **OTP Verification** → User receives and enters 6-digit OTP
4. **Address Form** → New user fills in name and address details
5. **Dashboard** → User sees their profile and can schedule pickups

### Existing User Journey
1. **Login Page** → User enters email address
2. **OTP Verification** → User receives and enters 6-digit OTP
3. **Dashboard** → User sees profile, address, and order history
4. **Actions Available**:
   - Update address (creates new version, links to previous)
   - Schedule new pickup
   - View order history

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Git

### 1. Clone and Setup
   ```bash
git clone <repository-url>
cd venture
```

### 2. Configure Environment
Create a `.env` file in the project root:
```bash
# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_ENV=development

# Database Configuration
DATABASE_URL=sqlite:///site.db

# Email Configuration (Gmail Example)
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
```

### 3. Start Application
   ```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 4. Access Application
- **Web Application**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

## 🔧 Development

### Docker Commands
     ```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f web

# Execute commands in container
docker-compose exec web bash

# Rebuild after changes
docker-compose up --build

# Stop services
docker-compose down

# Clean up everything
docker-compose down -v
docker system prune -a --volumes -f
```

### Database Operations
```bash
# Access database
docker-compose exec web sqlite3 /app/site.db

# Run migrations
docker-compose exec web alembic upgrade head

# Create new migration
docker-compose exec web alembic revision --autogenerate -m "Description"

# Check migration status
docker-compose exec web alembic current
```

### Code Structure

#### Models (`app/models.py`)
- **User**: Core user entity with email, name, and timestamps
- **Address**: Address management with versioning support
- **Order**: Pickup order tracking with image support

#### Routes (`app/routes.py`)
- **Authentication**: OTP generation, verification, and session management
- **User Management**: Address forms, dashboard, profile updates
- **Order Management**: Pickup scheduling and order history
- **API Endpoints**: Form submissions and notifications

#### Utilities
- **OTP System** (`app/utils/otp.py`): Secure OTP generation and Redis-based verification
- **Email Service** (`app/utils/emailer.py`): SMTP-based email delivery
- **Configuration** (`app/utils/config.py`): Environment-based configuration management

## 🔐 Security Features

### OTP Authentication
- **6-digit numeric OTPs** with 5-minute TTL
- **Redis-based storage** for session management
- **Automatic cleanup** of expired OTPs
- **Rate limiting** and session validation

### Session Management
- **Secure session cookies** with HTTP-only flags
- **Session-based user tracking** with Redis fallback
- **Automatic session cleanup** on logout

### Data Protection
- **SQL injection prevention** via SQLAlchemy ORM
- **XSS protection** through template escaping
- **CSRF protection** via Flask-WTF (configurable)

## 📧 Email Integration

### Supported Providers
- **Gmail SMTP** (with App Passwords)
- **SendGrid** (API key)
- **Custom SMTP servers**

### Email Features
- **OTP delivery** with HTML formatting
- **Error handling** and retry logic
- **Template-based emails** for consistency

## 🐳 Docker Architecture

### Services
1. **Web Application** (`venture-web`)
   - Flask application with Gunicorn
   - Port 8000 (mapped to host)
   - Volume mounts for development

2. **Redis** (`venture-redis`)
   - Session and OTP storage
   - Port 6379 (internal)
   - Persistent volume storage

### Container Features
- **Multi-stage builds** for optimized images
- **Non-root user** for security
- **Health checks** for service monitoring
- **Volume persistence** for data storage

## 🧪 Testing

### Manual Testing
   ```bash
# Test OTP flow
1. Visit http://localhost:8000
2. Enter email and request OTP
3. Check email for OTP
4. Enter OTP and verify login

# Test user flow
1. Complete address form
2. Verify dashboard display
3. Test address update
4. Test pickup scheduling
```

### Database Testing
```bash
# Check user creation
docker-compose exec web sqlite3 /app/site.db "SELECT * FROM user;"

# Check address creation
docker-compose exec web sqlite3 /app/site.db "SELECT * FROM address;"

# Check order creation
docker-compose exec web sqlite3 /app/site.db "SELECT * FROM \"order\";"
```

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Set production values
2. **SSL/TLS**: Configure HTTPS
3. **Database**: Consider PostgreSQL for production
4. **Redis**: Use managed Redis service
5. **Email**: Configure production SMTP
6. **Monitoring**: Add health checks and logging

### Deployment Options
- **Docker Swarm**: For container orchestration
- **Kubernetes**: For large-scale deployments
- **Cloud Platforms**: AWS, GCP, Azure
- **PaaS**: Heroku, Railway, Render

## 🔍 Troubleshooting

### Common Issues

#### OTP Not Received
```bash
# Check email configuration
docker-compose logs web | grep -i email

# Verify SMTP settings in .env
# Check spam folder
```

#### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d --build

# Check migration status
docker-compose exec web alembic current
```

#### Container Issues
   ```bash
# Rebuild containers
docker-compose build --no-cache

# Clean Docker system
docker system prune -a --volumes -f
```

### Logs and Debugging
   ```bash
# View application logs
docker-compose logs -f web

# View Redis logs
docker-compose logs -f redis

# Access container shell
docker-compose exec web bash
```

## 📚 API Reference

### Authentication Endpoints
- `POST /login` - Request OTP
- `POST /verify-otp` - Verify OTP and login
- `GET /logout` - Logout user

### User Management
- `GET /dashboard` - User dashboard
- `GET /address-form` - New user address form
- `POST /address-form` - Submit address
- `GET /update-address` - Address update form
- `POST /update-address` - Submit address update

### Order Management
- `GET /schedule-pickup` - Pickup scheduling form
- `POST /schedule-pickup` - Submit pickup request

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the logs for error details

---

**Built with ❤️ using Flask, Docker, and Redis** 