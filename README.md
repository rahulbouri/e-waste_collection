# Social Venture Web Application

## Project Overview

This is a Python-based web application skeleton that provides:

- A static homepage with in-page navigation (anchor links).
- A login page that authenticates users via OTP sent to their email.
- New-user onboarding through a Google Form to collect additional details.
- Post-form submission API calls to integrate with downstream services.
- Deployment instructions for hosting the final site.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Setup and Installation](#setup-and-installation)
4. [Docker Setup](#docker-setup)
5. [Frontend Development](#frontend-development)
6. [Backend Development](#backend-development)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [References & Links](#references--links)

---

## Prerequisites

- Python 3.10+ installed on your system
- pip (Python package manager)
- conda (for environment management)
- Docker and Docker Compose (for containerized setup)
- A service for sending emails (e.g., SendGrid, Gmail SMTP)
- Google account to create Forms
- A hosting provider (e.g., Heroku, AWS, PythonAnywhere)

---

## Project Structure

```bash
project-root/
├── app/                     # Python application package
│   ├── templates/           # HTML templates
│   │   ├── index.html       # Homepage
│   │   ├── login.html       # Login page
│   │   └── dashboard.html   # Dashboard page
│   ├── static/
│   │   └── css/
│   │       └── styles.css   # CSS for entire site
│   ├── __init__.py          # Flask app factory
│   ├── routes.py            # URL routes and logic
│   ├── models.py            # Database models
│   └── utils/               # Helper modules
│       ├── config.py        # Configuration settings
│       ├── otp.py           # OTP generation & verification
│       └── emailer.py       # Email-sending functions
├── migrations/              # Database migrations
├── .env                     # Environment variables (gitignored)
├── .dockerignore           # Docker ignore file
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker services orchestration
├── requirements.txt        # Python dependencies
├── README.md               # This documentation
├── SETUP.md                # Detailed setup guide
└── Procfile                # (For Heroku deployment)
```

---

## Setup and Installation

### Option 1: Traditional Setup

1. **Create and activate conda environment**

   ```bash
   conda create -n social python=3.10 -y
   conda activate social
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**

   - Copy `.envexample` to `.env`:
     ```bash
     cp .envexample .env
     ```
   - Set the following variables in `.env`:
     ```dotenv
     FLASK_APP=app
     FLASK_ENV=development
     SECRET_KEY=<your-secret-key>
     DATABASE_URL=sqlite:///site.db
     EMAIL_HOST=smtp.sendgrid.net
     EMAIL_PORT=587
     EMAIL_USER=apikey         # for SendGrid
     EMAIL_PASS=<your-sendgrid-api-key>
     GOOGLE_FORM_URL=<your-google-form-public-url>
     ```

4. **Initialize the Database**

   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

### Option 2: Docker Setup (Recommended)

1. **Install Docker and Docker Compose**

   - [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Compose)
   - Or install separately on Linux:
     ```bash
     # Install Docker
     curl -fsSL https://get.docker.com -o get-docker.sh
     sudo sh get-docker.sh
     
     # Install Docker Compose
     sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
     sudo chmod +x /usr/local/bin/docker-compose
     ```

2. **Configure Environment Variables**

   Create a `.env` file in the project root:
   ```bash
   # Flask Configuration
   SECRET_KEY=your-secret-key-here
   FLASK_ENV=development

   # Database Configuration
   DATABASE_URL=sqlite:///site.db

   # Email Configuration (for sending OTP)
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

3. **Build and Start Services**

   ```bash
   # Build and start all services
   docker-compose up --build

   # Or run in detached mode
   docker-compose up -d --build
   ```

4. **Initialize Database (First time only)**

   ```bash
   # Run database migrations
   docker-compose exec web flask db init
   docker-compose exec web flask db migrate -m "Initial migration"
   docker-compose exec web flask db upgrade
   ```

5. **Access the Application**

   - **Web Application**: http://localhost:8000
   - **Redis Commander** (optional): http://localhost:8081
   - **Redis CLI**: `docker-compose exec redis redis-cli`

---

## Docker Setup

### Services Overview

The Docker setup includes three main services:

1. **Web Application** (`web`)
   - Flask application with Gunicorn
   - Runs on port 8000
   - Connected to Redis and SQLite

2. **Redis** (`redis`)
   - Session storage for OTP management
   - Runs on port 6379
   - Persistent data storage

3. **Redis Commander** (`redis-commander`) - Optional
   - Web UI for Redis management
   - Runs on port 8081
   - Only started with monitoring profile

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Start with monitoring (includes Redis Commander)
docker-compose --profile monitoring up

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f web

# Execute commands in container
docker-compose exec web flask shell
docker-compose exec redis redis-cli

# Rebuild after code changes
docker-compose up --build

# Update dependencies
docker-compose build --no-cache
```

### Development Workflow

1. **Start the environment:**
   ```bash
   docker-compose up -d
   ```

2. **Make code changes** (files are mounted as volumes)

3. **Restart the web service:**
   ```bash
   docker-compose restart web
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f web
   ```

### Production Considerations

For production deployment:

1. **Update environment variables:**
   ```bash
   FLASK_ENV=production
   SECRET_KEY=<strong-secret-key>
   ```

2. **Use external Redis:**
   ```bash
   REDIS_HOST=<your-redis-host>
   REDIS_PASSWORD=<your-redis-password>
   ```

3. **Configure email service:**
   ```bash
   MAIL_SERVER=<your-smtp-server>
   MAIL_USERNAME=<your-email>
   MAIL_PASSWORD=<your-password>
   ```

---

## Frontend Development

- **Homepage with Anchor Links**: See `app/templates/index.html` for a sample navigation bar and sections. Use `<nav>` and anchor tags to jump within the page.
- **Login Page UI**: See `app/templates/login.html` for a simple email input and "Send OTP" button.
- **Dashboard Page**: See `app/templates/dashboard.html` for the post-login interface.
- **CSS**: All styles in `app/static/css/styles.css`.

---

## Backend Development

- **Flask** is used as the web framework.
- **Database**: SQLAlchemy models in `app/models.py`.
- **OTP Workflow**: OTP generation in `app/utils/otp.py`, email sending in `app/utils/emailer.py`.
- **Session Management**: Redis-based session storage with fallback to in-memory.
- **Google Form Integration**: Redirect new users to a Google Form. Webhook endpoint at `/api/form-submit`.
- **API Stubs**: Placeholder endpoints in `app/routes.py` for future integrations.

---

## Testing

- Use `pytest` for unit tests.
- Test OTP, email sending (mock), Google Form webhook, and anchor navigation.
- Run tests in Docker:
  ```bash
  docker-compose exec web python test_otp.py
  ```

---

## Deployment

### Docker Deployment

1. **Build production image:**
   ```bash
   docker build -t your-app-name .
   ```

2. **Run with production environment:**
   ```bash
   docker run -d \
     -p 8000:8000 \
     -e FLASK_ENV=production \
     -e SECRET_KEY=<your-secret-key> \
     your-app-name
   ```

### Traditional Deployment

1. **Choose Hosting Provider** (Heroku, PythonAnywhere, etc.)
2. **Procfile** for Heroku:
   ```Procfile
   web: gunicorn app:app
   ```
3. **Set Config Vars** on hosting dashboard using same ENV keys as `.env`.
4. **Push to Remote**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push heroku main
   ```
5. **Run Migrations in Production**
   ```bash
   heroku run flask db upgrade
   ```
6. **Configure Domain & HTTPS**

---

## References & Links

- [Flask Official Documentation](https://flask.palletsprojects.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [SendGrid Email API](https://docs.sendgrid.com/)
- [Google Forms Apps Script Webhooks](https://developers.google.com/apps-script)
- [HTML Anchor Links](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a)
- [Redis Documentation](https://redis.io/documentation)

---

*This README provides a high-level overview and step-by-step instructions for setting up, developing, and deploying your web application. Update the placeholders and sections as you build out your project.* 