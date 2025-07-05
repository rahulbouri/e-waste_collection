# Render Deployment Checklist

## ✅ **Pre-Deployment Verification**

### 1. Dockerfile Requirements
- [x] Uses `PORT` environment variable (not hardcoded)
- [x] Uses `HOST` environment variable (not hardcoded)
- [x] Exposes port with `${PORT:-5000}` syntax
- [x] Health check uses `$PORT` variable
- [x] Non-root user for security
- [x] Startup script is executable

### 2. Startup Script Requirements
- [x] Reads `PORT` and `HOST` from environment
- [x] Handles Render vs local development
- [x] Runs database migrations
- [x] Starts gunicorn with correct binding
- [x] Proper error handling

### 3. Environment Variables
- [x] `SECRET_KEY` - Strong secret key
- [x] `DATABASE_URL` - PostgreSQL connection string
- [x] `REDIS_URL` - Redis connection string
- [x] `MAIL_USERNAME` - Email for OTP
- [x] `MAIL_PASSWORD` - Email app password
- [x] `MAIL_DEFAULT_SENDER` - Email sender

### 4. Render-Specific Variables (Auto-set)
- [x] `PORT` - Set by Render automatically
- [x] `HOST` - Set by Render automatically
- [x] Do NOT override these variables

## 🧪 **Testing Commands**

### Test Local Build
```bash
./test-render-build.sh
```

### Test Docker Build
```bash
docker build -t eco-collect-test .
```

### Test with Render Environment
```bash
docker run --rm \
  -e PORT=10000 \
  -e HOST=0.0.0.0 \
  -e SECRET_KEY=test-secret \
  -p 10000:10000 \
  eco-collect-test
```

## 🚀 **Deployment Steps**

### 1. Git Repository
- [ ] Push all changes to Git repository
- [ ] Ensure all files are committed
- [ ] Verify `.gitignore` excludes sensitive files

### 2. Render Dashboard
- [ ] Create new Web Service
- [ ] Connect Git repository
- [ ] Set environment to "Docker"
- [ ] Leave build/start commands empty
- [ ] Enable auto-deploy

### 3. Environment Variables
- [ ] Add all required environment variables
- [ ] Do NOT set PORT or HOST (Render sets these)
- [ ] Test database connection
- [ ] Test email configuration

### 4. Database Setup
- [ ] Create Render PostgreSQL service
- [ ] Copy internal database URL
- [ ] Set as `DATABASE_URL`
- [ ] Test database connection

### 5. Redis Setup (Optional)
- [ ] Create Render Redis service
- [ ] Copy internal Redis URL
- [ ] Set as `REDIS_URL`
- [ ] Test Redis connection

## 🔍 **Post-Deployment Verification**

### 1. Build Success
- [ ] Docker build completes successfully
- [ ] No build errors in logs
- [ ] All dependencies installed

### 2. Application Start
- [ ] Application starts without errors
- [ ] Binds to correct port (check logs)
- [ ] Database migrations run successfully
- [ ] Health check passes

### 3. Functionality Test
- [ ] Frontend loads at root URL
- [ ] API endpoints respond correctly
- [ ] Database operations work
- [ ] Email functionality works (if configured)

### 4. Health Checks
- [ ] `/health` endpoint responds
- [ ] `/api/health` endpoint responds
- [ ] Application logs show no errors

## 🚨 **Common Issues & Solutions**

### Port Binding Issues
**Problem**: "No open ports detected"
**Solution**: Ensure startup script uses `$PORT` variable

### Database Connection Issues
**Problem**: "Database connection failed"
**Solution**: Check `DATABASE_URL` format and credentials

### Email Issues
**Problem**: "Email not sending"
**Solution**: Verify Gmail app password and 2FA setup

### Build Failures
**Problem**: "Docker build failed"
**Solution**: Check all files are committed to repository

## 📞 **Support Resources**

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)

## ✅ **Final Verification**

Before going live:
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Database populated (if needed)
- [ ] Email configured and tested
- [ ] SSL certificate active
- [ ] Monitoring alerts set up
- [ ] Backup strategy in place

---

**Your application is ready for Render deployment! 🚀** 