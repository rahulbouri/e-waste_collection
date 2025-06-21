import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change_me")
    SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT", "change_me_too")

    # Email Configuration for Gmail SSL
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 465))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "False").lower() in ('true', '1', 't')
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "True").lower() in ('true', '1', 't')
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    
    # Redis Configuration (optional, for production)
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
    REDIS_DB = int(os.getenv("REDIS_DB", 0))
    
    # OTP Configuration
    OTP_TTL_SECONDS = int(os.getenv("OTP_TTL_SECONDS", 300))  # 5 minutes
    OTP_LENGTH = int(os.getenv("OTP_LENGTH", 6))
