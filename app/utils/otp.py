import secrets
import string
from datetime import datetime, timedelta
from typing import Optional, Tuple
from flask import session
import redis
import json
from .config import Config

# Initialize Redis connection for session storage
try:
    redis_client = redis.Redis(
        host=Config.REDIS_HOST if hasattr(Config, 'REDIS_HOST') else 'localhost',
        port=Config.REDIS_PORT if hasattr(Config, 'REDIS_PORT') else 6379,
        db=0,
        decode_responses=True
    )
    # Test connection
    redis_client.ping()
    USE_REDIS = True
except:
    USE_REDIS = False
    print("Warning: Redis not available, falling back to in-memory storage")

# Fallback in-memory storage for development
_otp_storage = {}

def generate_otp() -> str:
    """Generate a secure 6-digit OTP"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def store_otp(email: str, otp_code: str, ttl_seconds: int = 300) -> str:
    """
    Store OTP with TTL and return session ID
    Args:
        email: User's email address
        otp_code: Generated OTP code
        ttl_seconds: Time to live in seconds (default 5 minutes)
    Returns:
        session_id: Unique session identifier
    """
    session_id = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(seconds=ttl_seconds)
    
    otp_data = {
        'email': email,
        'otp_code': otp_code,
        'expires_at': expires_at.isoformat(),
        'created_at': datetime.utcnow().isoformat()
    }
    
    if USE_REDIS:
        # Store in Redis with TTL
        redis_client.setex(
            f"otp:{session_id}",
            ttl_seconds,
            json.dumps(otp_data)
        )
    else:
        # Store in memory (for development)
        _otp_storage[session_id] = otp_data
    
    return session_id

def get_otp_data(session_id: str) -> Optional[dict]:
    """
    Retrieve OTP data for a session
    Args:
        session_id: Session identifier
    Returns:
        OTP data dict or None if not found/expired
    """
    if USE_REDIS:
        data = redis_client.get(f"otp:{session_id}")
        if data:
            return json.loads(data)
    else:
        data = _otp_storage.get(session_id)
        if data:
            # Check if expired
            expires_at = datetime.fromisoformat(data['expires_at'])
            if datetime.utcnow() < expires_at:
                return data
            else:
                # Remove expired data
                del _otp_storage[session_id]
    
    return None

def verify_otp(session_id: str, otp_code: str) -> Tuple[bool, str]:
    """
    Verify OTP for a session
    Args:
        session_id: Session identifier
        otp_code: OTP code to verify
    Returns:
        Tuple of (is_valid, message)
    """
    otp_data = get_otp_data(session_id)
    
    if not otp_data:
        return False, "OTP expired or invalid session"
    
    if otp_data['otp_code'] != otp_code:
        return False, "Invalid OTP code"
    
    # OTP is valid, clean up
    if USE_REDIS:
        redis_client.delete(f"otp:{session_id}")
    else:
        _otp_storage.pop(session_id, None)
    
    return True, "OTP verified successfully"

def cleanup_expired_otps():
    """Clean up expired OTPs from memory storage"""
    if not USE_REDIS:
        current_time = datetime.utcnow()
        expired_keys = []
        
        for session_id, data in _otp_storage.items():
            expires_at = datetime.fromisoformat(data['expires_at'])
            if current_time >= expires_at:
                expired_keys.append(session_id)
        
        for key in expired_keys:
            del _otp_storage[key]
