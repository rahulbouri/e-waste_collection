# 🚀 Quick Start Guide - Eco Collect Society Aid

Get your waste collection application running locally in **5 minutes**!

## Prerequisites

- ✅ Docker and Docker Compose installed
- ✅ Git (to clone the repository)
- ✅ Modern web browser

## Step 1: Setup Environment

```bash
# Copy environment file
cp env.example .env

# Generate a secure secret key (optional)
python3 -c "import secrets; print(secrets.token_hex(32))"
# Copy the output and update SECRET_KEY in .env file
```

## Step 2: Deploy with One Command

```bash
# Run the automated deployment script
./deploy-local.sh
```

**Or manually:**

```bash
# Build and start all services
docker-compose up --build -d

# Initialize database
docker-compose exec backend alembic upgrade head
```

## Step 3: Access Your Application

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:8000
- ❤️ **Health Check**: http://localhost:8000/api/health
- 📊 **Redis Admin**: http://localhost:8081

## Step 4: Test Your Deployment

```bash
# Run the test suite
./test-deployment.sh
```

## Step 5: Start Using the App

1. **Open** http://localhost:5173 in your browser
2. **Enter your email** to receive OTP
3. **Check the logs** for OTP (if email not configured):
   ```bash
   docker-compose logs backend | grep -i otp
   ```
4. **Complete registration** and create your first booking!

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Check status
docker-compose ps

# Clean up (removes all data)
docker-compose down -v
```

## Troubleshooting

### If something doesn't work:

1. **Check if all containers are running:**
   ```bash
   docker-compose ps
   ```

2. **View logs for errors:**
   ```bash
   docker-compose logs -f backend
   ```

3. **Restart everything:**
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

4. **Run the test suite:**
   ```bash
   ./test-deployment.sh
   ```

### Common Issues:

- **Port already in use**: Stop other services using ports 5000, 5173, 5432, 6379
- **Database connection failed**: Wait 30 seconds for PostgreSQL to start
- **OTP not received**: Check logs for OTP code or configure email in `.env`

## Next Steps

- 📖 Read the full [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
- 🔧 Configure email settings for OTP delivery
- 🚀 Deploy to production using the production guide

---

**Need help?** Check the logs with `docker-compose logs -f` or refer to the full deployment guide. 