from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, flash
from .utils.otp import generate_otp, store_otp, verify_otp, cleanup_expired_otps
from .utils.emailer import send_otp_email_html
from .models import User, OTPToken
from . import db
import re
from datetime import datetime, timedelta

main = Blueprint('main', __name__)

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        
        # Validate email
        if not email:
            return render_template('login.html', message='Email is required', error=True)
        
        if not is_valid_email(email):
            return render_template('login.html', message='Please enter a valid email address', error=True)
        
        try:
            # Generate OTP
            otp_code = generate_otp()
            
            # Store OTP with session management
            session_id = store_otp(email, otp_code)
            
            # Store session ID in Flask session
            session['otp_session_id'] = session_id
            session['email'] = email
            
            # Send OTP email
            email_sent = send_otp_email_html(email, otp_code)
            
            if email_sent:
                return render_template('login.html', 
                                     message='OTP sent successfully! Please check your email.', 
                                     show_otp_form=True,
                                     email=email)
            else:
                return render_template('login.html', 
                                     message='Failed to send OTP. Please try again.', 
                                     error=True)
                
        except Exception as e:
            print(f"Error in login: {str(e)}")
            return render_template('login.html', 
                                 message='An error occurred. Please try again.', 
                                 error=True)
    
    return render_template('login.html')

@main.route('/verify-otp', methods=['POST'])
def verify_otp_route():
    otp_code = request.form.get('otp', '').strip()
    session_id = session.get('otp_session_id')
    email = session.get('email')
    
    if not otp_code:
        return render_template('login.html', 
                             message='OTP code is required', 
                             error=True,
                             show_otp_form=True,
                             email=email)
    
    if not session_id:
        return render_template('login.html', 
                             message='Session expired. Please request a new OTP.', 
                             error=True)
    
    # Verify OTP
    is_valid, message = verify_otp(session_id, otp_code)
    
    if is_valid:
        # OTP is valid, create or update user
        try:
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(email=email)
                db.session.add(user)
                # Commit here to generate user.id for the new user
                db.session.commit()
            
            # Store OTP token in database for audit trail
            expires_at = datetime.utcnow() + timedelta(minutes=5)
            otp_token = OTPToken(
                user_id=user.id,
                otp_code=otp_code,
                expires_at=expires_at
            )
            db.session.add(otp_token)
            db.session.commit()
            
            # Clear session data
            session.pop('otp_session_id', None)
            session.pop('email', None)
            
            # Set user session
            session['user_id'] = user.id
            session['email'] = user.email
            
            return redirect(url_for('main.dashboard'))
            
        except Exception as e:
            print(f"Error creating user: {str(e)}")
            db.session.rollback()
            return render_template('login.html', 
                                 message='An error occurred. Please try again.', 
                                 error=True,
                                 show_otp_form=True,
                                 email=email)
    else:
        # Show specific error message for OTP mismatch
        error_message = "OTP credentials did not match" if "Invalid OTP code" in message else message
        return render_template('login.html', 
                             message=error_message, 
                             error=True,
                             show_otp_form=True,
                             email=email)

@main.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))
    
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        return redirect(url_for('main.login'))
    
    return render_template('dashboard.html', user=user)

@main.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('main.login'))

@main.route('/verify', methods=['POST'])
def verify():
    # Legacy endpoint - redirect to new verification flow
    return redirect(url_for('main.verify_otp_route'))

@main.route('/api/form-submit', methods=['POST'])
def form_submit():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    try:
        user = User.query.get(session['user_id'])
        if user:
            user.last_submitted_form_data = data
            db.session.commit()
            return '', 204
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to save data'}), 500

@main.route('/api/notify', methods=['POST'])
def notify():
    # Placeholder for future integration
    return jsonify({'status': 'received'}), 200

# Cleanup expired OTPs periodically
@main.before_request
def cleanup_otps():
    cleanup_expired_otps()
