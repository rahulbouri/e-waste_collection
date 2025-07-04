from flask import Blueprint, request, jsonify, session
from datetime import datetime
import re
from ..models import User, db
from ..utils.otp import generate_otp, store_otp, verify_otp, cleanup_expired_otps
from ..utils.emailer import send_otp_email_html
import logging


auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_bangalore_pincode(pincode):
    """Validate Bangalore pincode format"""
    return re.match(r'^560\d{3}$', pincode) is not None

def is_valid_indian_phone(phone):
    """Validate Indian phone number format"""
    return re.match(r'^\d{10}$', phone) is not None

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """Send OTP to user's email"""
    logger.info("OTP send request received")
    logger.debug(f"Session at send_otp: {dict(session)}")
    
    data = request.get_json()
    if not data or 'email' not in data:
        logger.warning("OTP request missing email")
        return jsonify({'error': 'Email is required'}), 400
    
    email = data['email'].lower().strip()
    logger.info(f"Processing OTP request for email: {email}")
    
    try:
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if not user:
            logger.info(f"Creating new user for email: {email}")
            # Create new user
            user = User(
                email=email,
                name=email.split('@')[0],  # Use email prefix as default name
                phone=''  # Empty phone number
            )
            db.session.add(user)
            db.session.commit()
            logger.info(f"New user created with ID: {user.id}")
        
        # Set pending email in session to ensure cookie is set
        session['pending_email'] = email
        
        # Generate and store OTP
        otp = generate_otp()
        logger.debug(f"Generated OTP for user {user.id}: {otp}")
        logger.debug(f"Session before storing OTP: {dict(session)}")
        
        # Store OTP in Redis
        if not store_otp(user.id, otp):
            logger.error(f"Failed to store OTP in Redis for user {user.id}")
            return jsonify({'error': 'Failed to store OTP'}), 500
        
        logger.info(f"OTP stored in Redis for user {user.id}")
        logger.debug(f"Session after storing OTP: {dict(session)}")
        
        # Send OTP via email
        try:
            send_otp_email_html(email, otp)
            logger.info(f"OTP email sent successfully to {email}")
        except Exception as e:
            logger.error(f"Failed to send OTP email: {e}")
            return jsonify({'error': 'Failed to send OTP email'}), 500
        
        return jsonify({'message': 'OTP sent successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error in send_otp: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp_route():
    """Verify OTP and log user in"""
    logger.info("OTP verification request received")
    logger.debug(f"Session at verify_otp: {dict(session)}")
    
    data = request.get_json()
    if not data or 'email' not in data or 'otp' not in data:
        logger.warning("OTP verification request missing email or OTP")
        return jsonify({'error': 'Email and OTP are required'}), 400
    
    email = data['email'].lower().strip()
    otp = data['otp'].strip()
    logger.info(f"Verifying OTP for email: {email}")
    
    try:
        # Find user
        user = User.query.filter_by(email=email).first()
        logger.debug(f"Verifying OTP for user_id={user.id if user else None}, email={email}, session={dict(session)}")
        if not user:
            logger.warning(f"User not found for email: {email}")
            return jsonify({'error': 'User not found'}), 404
        
        # Verify OTP
        otp_valid = verify_otp(user.id, otp)
        logger.debug(f"OTP verification result for user_id={user.id}: {otp_valid}, session={dict(session)}")
        if otp_valid:
            logger.info(f"OTP verified successfully for user {user.id}")
            
            # Log user in
            session['user_id'] = user.id
            session['email'] = user.email
            
            # Update user's last login
            user.last_login_at = datetime.utcnow()
            db.session.commit()
            
            # Check if user has completed profile (has name and phone)
            is_new_user = not user.name or user.name == email.split('@')[0] or not user.phone
            
            logger.info(f"User {user.id} logged in successfully. Is new user: {is_new_user}")
            logger.debug(f"Session after login: {dict(session)}")
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'phone': user.phone
                },
                'is_new_user': is_new_user
            }), 200
        else:
            logger.warning(f"Invalid OTP for user {user.id}")
            logger.debug(f"Session after failed OTP: {dict(session)}")
            return jsonify({'error': 'Invalid OTP'}), 401
            
    except Exception as e:
        logger.error(f"Error in verify_otp: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user with additional details"""
    logger.info("User registration request received")
    
    data = request.get_json()
    if not data or 'email' not in data or 'name' not in data:
        logger.warning("Registration request missing required fields")
        return jsonify({'error': 'Email and name are required'}), 400
    
    email = data['email'].lower().strip()
    name = data['name'].strip()
    phone = data.get('phone', '').strip()
    
    logger.info(f"Processing registration for email: {email}, name: {name}")
    
    try:
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            logger.warning(f"Registration attempt for existing email: {email}")
            return jsonify({'error': 'User already exists'}), 409
        
        # Create new user
        user = User(
            email=email,
            name=name,
            phone=phone
        )
        db.session.add(user)
        db.session.commit()
        
        logger.info(f"New user registered with ID: {user.id}")
        
        # Log user in
        session['user_id'] = user.id
        session['email'] = user.email
        
        return jsonify({
            'message': 'Registration successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'phone': user.phone
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Error in registration: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Log user out"""
    logger.info("Logout request received")
    
    if 'user_id' in session:
        user_id = session['user_id']
        logger.info(f"Logging out user {user_id}")
        session.clear()
        return jsonify({'message': 'Logged out successfully'}), 200
    else:
        logger.warning("Logout attempt without active session")
        return jsonify({'error': 'No active session'}), 401

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user information"""
    logger.debug("Current user request received")
    
    if 'user_id' not in session:
        logger.warning("Current user request without active session")
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        user = User.query.get(session['user_id'])
        if not user:
            logger.warning(f"User {session['user_id']} not found in database")
            session.clear()
            return jsonify({'error': 'User not found'}), 404
        
        # Get the user's current address (most recent one)
        current_address = None
        if user.addresses:
            # Get the most recent address or the one marked as current
            current_address = next((addr for addr in user.addresses if addr.is_current), None)
            if not current_address:
                # If no address is marked as current, get the most recent one
                current_address = max(user.addresses, key=lambda addr: addr.created_at)
        
        user_data = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'phone': user.phone
        }
        
        # Add address information if available
        if current_address:
            user_data['address'] = current_address.address
            user_data['pincode'] = current_address.pincode
            user_data['city'] = current_address.city
            user_data['state'] = current_address.state
        else:
            user_data['address'] = ''
            user_data['pincode'] = ''
            user_data['city'] = ''
            user_data['state'] = ''
        
        logger.debug(f"Returning user info for user {user.id}")
        return jsonify(user_data), 200
        
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Cleanup expired OTPs before each request
@auth_bp.before_request
def cleanup_otps():
    cleanup_expired_otps() 