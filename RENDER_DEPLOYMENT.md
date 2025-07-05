# Render Deployment Guide

This guide will help you deploy your Eco Collect Society Aid application to Render.

## Prerequisites

1. A Render account (free tier available)
2. Your code pushed to a Git repository (GitHub, GitLab, etc.)
3. Environment variables configured

## Step 1: Prepare Your Repository

Your repository should contain:
- `Dockerfile` (already configured)
- `startup.sh` (already configured)
- `nginx.conf` (already configured)
- `backend/` directory with your Flask application
- `src/` directory with your React frontend
- `package.json` and other frontend files

## Step 2: Create a Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Configure the service:

### Basic Configuration
- **Name**: `eco-collect-app` (or your preferred name)
- **Environment**: `Docker`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (uses repository root)

### Build & Deploy Settings
- **Build Command**: Leave empty (uses Dockerfile)
- **Start Command**: Leave empty (uses Dockerfile CMD)
- **Auto-Deploy**: Enable for automatic deployments
- **Port**: Leave empty (Render will set PORT automatically)

## Step 3: Configure Environment Variables

In your Render service settings, add these environment variables:

### Required Variables
```
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=postgresql://username:password@host:port/database_name
REDIS_URL=redis://username:password@host:port/database_number
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

**Note**: Render automatically sets `PORT` and `HOST` environment variables. Do not override these.

### Optional Variables
```
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
OTP_TTL_SECONDS=300
OTP_LENGTH=6
```

## Step 4: Set Up Database

### Option A: Render PostgreSQL (Recommended)
1. Create a new PostgreSQL service in Render
2. Copy the internal database URL
3. Set it as `DATABASE_URL` in your web service

### Option B: External Database
Use any PostgreSQL service (AWS RDS, DigitalOcean, etc.)

## Step 5: Set Up Redis (Optional)

### Option A: Render Redis
1. Create a new Redis service in Render
2. Copy the internal Redis URL
3. Set it as `REDIS_URL` in your web service

### Option B: External Redis
Use any Redis service (Redis Cloud, AWS ElastiCache, etc.)

## Step 6: Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use your Gmail address and app password in the environment variables

## Step 7: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the build logs for any issues
4. Once deployed, your app will be available at `https://your-app-name.onrender.com`

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all files are committed to your repository
   - Verify the Dockerfile syntax
   - Check build logs for specific errors

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from Render's network
   - Check if database requires SSL

3. **Email Not Working**
   - Verify Gmail app password is correct
   - Check if 2FA is enabled on Gmail
   - Test email configuration locally first

4. **Application Not Starting**
   - Check application logs in Render dashboard
   - Verify all required environment variables are set
   - Ensure the app binds to the PORT environment variable (not hardcoded)
   - Check if the startup script is executable

### Health Checks

Your application includes health checks at:
- `https://your-app-name.onrender.com/health`
- `https://your-app-name.onrender.com/api/health`

### Logs

View logs in Render dashboard:
1. Go to your web service
2. Click "Logs" tab
3. Monitor for errors and application status

## Security Considerations

1. **Environment Variables**: Never commit secrets to your repository
2. **Database**: Use strong passwords and enable SSL
3. **Email**: Use app passwords, not regular passwords
4. **HTTPS**: Render provides automatic HTTPS certificates

## Performance Optimization

1. **Database**: Use connection pooling for better performance
2. **Caching**: Redis helps with session storage and caching
3. **Static Files**: Nginx serves static files efficiently
4. **CDN**: Consider using a CDN for global distribution

## Monitoring

1. **Uptime**: Render provides basic uptime monitoring
2. **Logs**: Monitor application logs for errors
3. **Metrics**: Track database and Redis performance
4. **Alerts**: Set up alerts for critical issues

## Cost Optimization

1. **Free Tier**: Render offers free tier with limitations
2. **Auto-Sleep**: Free services sleep after inactivity
3. **Database**: Consider external databases for better performance
4. **Scaling**: Upgrade only when needed

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Your Application Logs](https://dashboard.render.com/web/your-service/logs) 