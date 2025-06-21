# Email OTP Service Setup Guide

This application provides a robust Email OTP (One-Time Password) service that can handle multiple concurrent users with secure session management.

## Features

- ✅ Secure 6-digit OTP generation
- ✅ 5-minute TTL (Time To Live) for OTPs
- ✅ Unique session management for concurrent users
- ✅ Email-based OTP delivery
- ✅ Automatic cleanup of expired OTPs
- ✅ Redis support for production scalability
- ✅ Fallback to in-memory storage for development
- ✅ Audit trail for OTP usage

## Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```env
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

   # Redis Configuration (optional, for production)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0

   # OTP Configuration
   OTP_TTL_SECONDS=300
   OTP_LENGTH=6
   ```

3. **Email Setup (Gmail Example):**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password
   - Use the App Password in `MAIL_PASSWORD`

4. **Redis Setup (Optional for Production):**
   ```bash
   # Install Redis
   # macOS: brew install redis
   # Ubuntu: sudo apt-get install redis-server
   
   # Start Redis
   redis-server
   ```

## Usage

1. **Start the application:**
   ```bash
   python -m flask run
   ```

2. **Access the application:**
   - Open http://localhost:5000/login
   - Enter your email address
   - Click "Send OTP"
   - Check your email for the 6-digit code
   - Enter the OTP code
   - You'll be redirected to the dashboard upon successful verification

## Architecture

### Session Management
- Each user gets a unique session ID when requesting an OTP
- OTPs are stored with TTL (5 minutes by default)
- Redis is used in production for scalability
- In-memory storage is used as fallback for development

### Security Features
- 6-digit cryptographically secure OTPs
- Automatic expiration after 5 minutes
- Session-based verification
- Email validation
- Audit trail in database

### Scalability
- Redis-based storage for high-traffic scenarios
- Automatic cleanup of expired OTPs
- Stateless session management
- Concurrent user support

## API Endpoints

- `GET /login` - Display login form
- `POST /login` - Send OTP to email
- `POST /verify-otp` - Verify OTP and authenticate user
- `GET /dashboard` - User dashboard (requires authentication)
- `GET /logout` - Logout user

## Database Models

### User
- `id`: Primary key
- `email`: User's email address (unique)
- `name`: User's name (optional)
- `last_submitted_form_data`: JSON field for form data
- `otps`: Relationship to OTP tokens

### OTPToken
- `id`: Primary key
- `user_id`: Foreign key to User
- `otp_code`: The OTP code
- `expires_at`: Expiration timestamp
- `created_at`: Creation timestamp

## Production Deployment

1. **Set up Redis:**
   ```bash
   # Install Redis on your server
   # Configure Redis for production (authentication, etc.)
   ```

2. **Configure environment:**
   ```env
   FLASK_ENV=production
   SECRET_KEY=your-production-secret-key
   MAIL_SERVER=your-smtp-server
   MAIL_USERNAME=your-email
   MAIL_PASSWORD=your-password
   REDIS_HOST=your-redis-host
   REDIS_PASSWORD=your-redis-password
   ```

3. **Use a production WSGI server:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 "app:create_app()"
   ```

## Troubleshooting

### Email not sending
- Check your email credentials in `.env`
- Ensure 2FA is enabled and App Password is used (for Gmail)
- Check SMTP server settings

### Redis connection issues
- Ensure Redis is running: `redis-cli ping`
- Check Redis configuration in `.env`
- The app will fall back to in-memory storage if Redis is unavailable

### OTP not working
- Check if the OTP has expired (5 minutes)
- Verify the session is still valid
- Check server logs for errors

## Security Considerations

- Always use HTTPS in production
- Keep your `SECRET_KEY` secure and unique
- Use strong email passwords
- Consider rate limiting for OTP requests
- Monitor for suspicious activity
- Regularly rotate secrets 