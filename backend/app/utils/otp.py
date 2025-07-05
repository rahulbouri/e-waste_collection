import secrets
import string
from datetime import datetime, timedelta
from typing import Optional, Tuple
import redis
import json
from flask import current_app
import logging

logger = logging.getLogger(__name__)

def get_redis_client():
    """Get Redis client within Flask app context"""
    try:
        # Use REDIS_URL if available, otherwise fall back to individual parameters
        redis_url = current_app.config.get('REDIS_URL')
        if redis_url:
            redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
        else:
            redis_client = redis.Redis(
                host=current_app.config.get('REDIS_HOST', 'localhost'),
                port=current_app.config.get('REDIS_PORT', 6379),
                password=current_app.config.get('REDIS_PASSWORD'),
                db=current_app.config.get('REDIS_DB', 0),
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
        # Test connection
        redis_client.ping()
        return redis_client
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        raise Exception("Redis connection failed - Redis is required for OTP functionality")

def generate_otp() -> str:
    """Generate a secure 6-digit OTP"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def store_otp(user_id: int, otp_code: str, ttl_seconds: int = 300) -> bool:
    """
    Store OTP in Redis with TTL
    Args:
        user_id: User ID
        otp_code: Generated OTP code
        ttl_seconds: Time to live in seconds (default 5 minutes)
    Returns:
        bool: True if stored successfully
    """
    try:
        redis_client = get_redis_client()
        key = f"otp:{user_id}"
        
        otp_data = {
            'otp_code': otp_code,
            'expires_at': (datetime.utcnow() + timedelta(seconds=ttl_seconds)).isoformat(),
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Store in Redis with TTL
        redis_client.setex(
            key,
            ttl_seconds,
            json.dumps(otp_data)
        )
        
        logger.info(f"OTP stored in Redis for user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to store OTP in Redis: {e}")
        raise Exception("Failed to store OTP - Redis is required")

def verify_otp(user_id: int, otp_code: str) -> bool:
    """
    Verify OTP for a user
    Args:
        user_id: User ID
        otp_code: OTP code to verify
    Returns:
        bool: True if OTP is valid
    """
    try:
        redis_client = get_redis_client()
        key = f"otp:{user_id}"
        
        # Get OTP data from Redis
        data = redis_client.get(key)
        if not data:
            logger.warning(f"No OTP found for user {user_id}")
            return False
        
        otp_data = json.loads(str(data))
        
        # Check if OTP matches
        if otp_data['otp_code'] != otp_code:
            logger.warning(f"Invalid OTP for user {user_id}")
            return False
        
        # Check if OTP is expired
        expires_at = datetime.fromisoformat(otp_data['expires_at'])
        if datetime.utcnow() > expires_at:
            logger.warning(f"Expired OTP for user {user_id}")
            # Clean up expired OTP
            redis_client.delete(key)
            return False
        
        # OTP is valid - clean it up
        redis_client.delete(key)
        logger.info(f"OTP verified successfully for user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to verify OTP: {e}")
        return False

def cleanup_expired_otps():
    """Clean up expired OTPs from Redis (Redis handles TTL automatically)"""
    # Redis automatically handles TTL, so no manual cleanup needed
    logger.debug("Redis TTL handles OTP expiration automatically") 