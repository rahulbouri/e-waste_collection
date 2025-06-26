from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, flash
from flask_cors import CORS
from .utils.otp import generate_otp, store_otp, verify_otp, cleanup_expired_otps
from .utils.emailer import send_otp_email_html
from .utils.whatsapp import send_whatsapp_message
from .models import User, Address, Order, BioWasteOrder
from . import db
import re
import base64
from datetime import datetime, timedelta
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

main = Blueprint('main', __name__)
CORS(main)  # Enable CORS for all routes

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/home')
def home():
    return render_template('home.html')

@main.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        
        logger.info(f"🔐 Login attempt for email: {email}")
        
        # Validate email
        if not email:
            logger.warning("❌ Login failed: Email is required")
            return render_template('login.html', message='Email is required', error=True)
        
        if not is_valid_email(email):
            logger.warning(f"❌ Login failed: Invalid email format: {email}")
            return render_template('login.html', message='Please enter a valid email address', error=True)
        
        try:
            # Generate OTP
            otp_code = generate_otp()
            logger.info(f"📧 Generated OTP for {email}: {otp_code}")
            
            # Store OTP with session management
            session_id = store_otp(email, otp_code)
            logger.info(f"💾 Stored OTP with session_id: {session_id}")
            
            # Store session ID in Flask session
            session['otp_session_id'] = session_id
            session['email'] = email
            logger.info(f"📝 Stored session data - session_id: {session_id}, email: {email}")
            
            # Send OTP email
            email_sent = send_otp_email_html(email, otp_code)
            
            if email_sent:
                logger.info(f"✅ OTP email sent successfully to {email}")
                return render_template('login.html', 
                                     message='OTP sent successfully! Please check your email.', 
                                     show_otp_form=True,
                                     email=email)
            else:
                logger.error(f"❌ Failed to send OTP email to {email}")
                return render_template('login.html', 
                                     message='Failed to send OTP. Please try again.', 
                                     error=True)
                
        except Exception as e:
            logger.error(f"❌ Error in login process: {str(e)}")
            return render_template('login.html', 
                                 message='An error occurred. Please try again.', 
                                 error=True)
    
    return render_template('login.html')

@main.route('/verify-otp', methods=['POST'])
def verify_otp_route():
    otp_code = request.form.get('otp', '').strip()
    session_id = session.get('otp_session_id')
    email = session.get('email')
    
    logger.info(f"🔍 OTP verification attempt - Email: {email}, Session ID: {session_id}, OTP: {otp_code}")
    
    if not otp_code:
        logger.warning("❌ OTP verification failed: OTP code is required")
        return render_template('login.html', 
                             message='OTP code is required', 
                             error=True,
                             show_otp_form=True,
                             email=email)
    
    if not session_id:
        logger.warning("❌ OTP verification failed: Session expired")
        return render_template('login.html', 
                             message='Session expired. Please request a new OTP.', 
                             error=True)
    
    # Verify OTP
    logger.info(f"🔐 Verifying OTP for session_id: {session_id}")
    is_valid, message = verify_otp(session_id, otp_code)
    logger.info(f"🔐 OTP verification result: {is_valid}, Message: {message}")
    
    if is_valid:
        logger.info(f"✅ OTP verified successfully for {email}")
        # OTP is valid, create or update user
        try:
            logger.info(f"👤 Checking if user exists for email: {email}")
            user = User.query.filter_by(email=email).first()
            
            if not user:
                logger.info(f"🆕 Creating new user for email: {email}")
                user = User(email=email)
                db.session.add(user)
                logger.info(f"💾 Added user to session: {user.email}")
                db.session.commit()
                logger.info(f"✅ User created successfully: {user.email} (ID: {user.id})")
            else:
                logger.info(f"👤 User already exists: {user.email} (ID: {user.id})")
            
            # Update last login time
            user.last_login_at = datetime.utcnow()
            db.session.commit()
            logger.info(f"🕐 Updated last login time for user: {user.email}")
            
            # Clear session data
            session.pop('otp_session_id', None)
            session.pop('email', None)
            logger.info("🧹 Cleared OTP session data")
            
            # Set user session
            session['user_id'] = user.id
            session['email'] = user.email
            logger.info(f"📝 Set user session - user_id: {user.id}, email: {user.email}")
            
            # Check if user has an address
            logger.info(f"🏠 Checking if user has address: {user.email}")
            address = Address.query.filter_by(user_email=email).first()
            if not address:
                logger.info(f"🆕 New user - redirecting to address form")
                return redirect(url_for('main.address_form'))
            else:
                logger.info(f"👤 Existing user - redirecting to dashboard")
                return redirect(url_for('main.dashboard'))
            
        except Exception as e:
            logger.error(f"❌ Error creating user: {str(e)}")
            db.session.rollback()
            return render_template('login.html', 
                                 message='An error occurred. Please try again.', 
                                 error=True,
                                 show_otp_form=True,
                                 email=email)
    else:
        # Show specific error message for OTP mismatch
        error_message = "OTP credentials did not match" if "Invalid OTP code" in message else message
        logger.warning(f"❌ OTP verification failed: {error_message}")
        return render_template('login.html', 
                             message=error_message, 
                             error=True,
                             show_otp_form=True,
                             email=email)

@main.route('/address-form', methods=['GET', 'POST'])
def address_form():
    if 'user_id' not in session:
        logger.warning("❌ Access denied to address form: No user_id in session")
        return redirect(url_for('main.login'))
    
    logger.info(f"🏠 Address form accessed by user_id: {session.get('user_id')}")
    
    if request.method == 'POST':
        try:
            # Get form data
            name = request.form.get('name', '').strip()
            google_maps = request.form.get('google_maps', '').strip()
            address = request.form.get('address', '').strip()
            postal_code = request.form.get('postal_code', '').strip()
            city = request.form.get('city', '').strip()
            state = request.form.get('state', '').strip()
            
            logger.info(f"📝 Address form submitted - User: {session.get('email')}, Name: {name}, Address: {address}")
            
            # Validate required fields
            if not name:
                logger.warning("❌ Address form validation failed: Name is required")
                flash('Name is required', 'error')
                return render_template('address_form.html')
            
            if not address:
                logger.warning("❌ Address form validation failed: Address is required")
                flash('Address is required', 'error')
                return render_template('address_form.html')
            
            # Update user's name
            user = User.query.get(session['user_id'])
            if user:
                user.name = name
                logger.info(f"👤 Updated user name: {user.email} -> {name}")
            
            # Create new address
            new_address = Address(
                user_email=session['email'],
                google_maps=google_maps,
                address=address,
                postal_code=postal_code,
                city=city,
                state=state
            )
            
            db.session.add(new_address)
            db.session.commit()
            logger.info(f"✅ Address created successfully for user: {session['email']}")
            
            flash('Address added successfully!', 'success')
            return redirect(url_for('main.dashboard'))
            
        except Exception as e:
            logger.error(f"❌ Error adding address: {str(e)}")
            db.session.rollback()
            flash('An error occurred while adding address', 'error')
            return render_template('address_form.html')
    
    return render_template('address_form.html')

@main.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        logger.warning("❌ Access denied to dashboard: No user_id in session")
        return redirect(url_for('main.login'))
    
    logger.info(f"📊 Dashboard accessed by user_id: {session.get('user_id')}")
    
    user = User.query.get(session['user_id'])
    if not user:
        logger.warning(f"❌ User not found for user_id: {session.get('user_id')}")
        session.clear()
        return redirect(url_for('main.login'))
    
    # Get user's most recent address (the one without a last_address value)
    address = Address.query.filter_by(user_email=user.email, last_address=None).first()
    if not address:
        # Fallback to any address if no current address found
        address = Address.query.filter_by(user_email=user.email).first()
    
    # Get user's orders
    orders = Order.query.filter_by(user_email=user.email).order_by(Order.date.desc()).all()
    
    logger.info(f"📊 Dashboard data - User: {user.email}, Address: {address is not None}, Orders: {len(orders)}")
    
    return render_template('dashboard.html', user=user, address=address, orders=orders)

@main.route('/update-address', methods=['GET', 'POST'])
def update_address():
    if 'user_id' not in session:
        logger.warning("❌ Access denied to update address: No user_id in session")
        return redirect(url_for('main.login'))
    
    logger.info(f"✏️ Update address accessed by user_id: {session.get('user_id')}")
    
    address = Address.query.filter_by(user_email=session['email']).first()
    if not address:
        logger.warning(f"❌ No address found for user: {session.get('email')}")
        return redirect(url_for('main.address_form'))
    
    if request.method == 'POST':
        try:
            # Store the current address_id as last_address before updating
            current_address_id = address.address_id
            
            # Create a new address record with the updated data
            new_address = Address(
                user_email=session['email'],
                google_maps=request.form.get('google_maps', '').strip(),
                address=request.form.get('address', '').strip(),
                postal_code=request.form.get('postal_code', '').strip(),
                city=request.form.get('city', '').strip(),
                state=request.form.get('state', '').strip(),
                last_address=current_address_id  # Link to the previous address
            )
            
            logger.info(f"📝 Address update submitted - User: {session.get('email')}, New Address: {new_address.address}, Last Address ID: {current_address_id}")
            
            # Validate required fields
            if not new_address.address:
                logger.warning("❌ Address update validation failed: Address is required")
                flash('Address is required', 'error')
                return render_template('update_address.html', address=address)
            
            # Add the new address
            db.session.add(new_address)
            db.session.commit()
            
            logger.info(f"✅ Address updated successfully for user: {session['email']} - New Address ID: {new_address.address_id}")
            flash('Address updated successfully!', 'success')
            return redirect(url_for('main.dashboard'))
            
        except Exception as e:
            logger.error(f"❌ Error updating address: {str(e)}")
            db.session.rollback()
            flash('An error occurred while updating address', 'error')
            return render_template('update_address.html', address=address)
    
    return render_template('update_address.html', address=address)

@main.route('/schedule-pickup', methods=['GET', 'POST'])
def schedule_pickup():
    if 'user_id' not in session:
        logger.warning("❌ Access denied to schedule pickup: No user_id in session")
        return redirect(url_for('main.login'))
    
    logger.info(f"🚚 Schedule pickup accessed by user_id: {session.get('user_id')}")
    
    # Get user's most recent address (the one without a last_address value)
    address = Address.query.filter_by(user_email=session['email'], last_address=None).first()
    if not address:
        # Fallback to any address if no current address found
        address = Address.query.filter_by(user_email=session['email']).first()
    
    if not address:
        logger.warning(f"❌ No address found for user: {session.get('email')}")
        flash('Please add an address first', 'error')
        return redirect(url_for('main.address_form'))
    
    if request.method == 'POST':
        try:
            # Get form data
            contact_number = request.form.get('contact_number', '').strip()
            description = request.form.get('description', '').strip()
            
            logger.info(f"📝 Pickup form submitted - User: {session.get('email')}, Contact: {contact_number}")
            
            # Validate required fields
            if not contact_number:
                logger.warning("❌ Pickup form validation failed: Contact number is required")
                flash('Contact number is required', 'error')
                return render_template('schedule_pickup.html')
            
            # Handle file uploads
            images = []
            if 'images' in request.files:
                uploaded_files = request.files.getlist('images')
                for file in uploaded_files:
                    if file and file.filename:
                        # Check file size (5MB limit)
                        file.seek(0, 2)  # Seek to end
                        file_size = file.tell()
                        file.seek(0)  # Reset to beginning
                        
                        if file_size > 5 * 1024 * 1024:  # 5MB in bytes
                            logger.warning(f"❌ File too large: {file.filename} ({file_size} bytes)")
                            flash(f'File {file.filename} is too large. Maximum size is 5MB.', 'error')
                            return render_template('schedule_pickup.html')
                        
                        # Convert to base64
                        file_content = file.read()
                        base64_string = base64.b64encode(file_content).decode('utf-8')
                        images.append(base64_string)
                        logger.info(f"📸 Image uploaded: {file.filename} ({file_size} bytes)")
            
            # Create new order
            new_order = Order(
                user_email=session['email'],
                address_id=address.address_id,
                contact_number=contact_number,
                description=description,
                images=images if images else None
            )
            
            db.session.add(new_order)
            db.session.commit()
            logger.info(f"✅ Pickup scheduled successfully for user: {session['email']}")

            # WhatsApp notification
            admin_number = os.getenv('WHATSAPP_ADMIN_NUMBER')
            msg = (
                f"New Pickup Scheduled!\n"
                f"User: {session['email']}\n"
                f"Contact: {contact_number}\n"
                f"Address: {address.address}, {address.city}, {address.state}, {address.postal_code}\n"
                f"Description: {description}"
            )
            try:
                if admin_number:
                    send_whatsapp_message(admin_number, msg)
                    logger.info(f"✅ WhatsApp notification sent to {admin_number}")
                else:
                    logger.warning("WHATSAPP_ADMIN_NUMBER not set in environment.")
            except Exception as e:
                logger.error(f"❌ Failed to send WhatsApp message: {str(e)}")

            flash('Pickup scheduled successfully!', 'success')
            return redirect(url_for('main.dashboard'))
            
        except Exception as e:
            logger.error(f"❌ Error scheduling pickup: {str(e)}")
            db.session.rollback()
            flash('An error occurred while scheduling pickup', 'error')
            return render_template('schedule_pickup.html')
    
    return render_template('schedule_pickup.html', address=address)

@main.route('/logout')
def logout():
    logger.info(f"🚪 Logout - User: {session.get('email')}")
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

# API Routes for React Frontend
@main.route('/api/check-auth')
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'authenticated': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'created_at': user.created_at.isoformat() if user.created_at else None,
                    'last_login_at': user.last_login_at.isoformat() if user.last_login_at else None
                }
            })
    return jsonify({'authenticated': False}), 401

@main.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get user profile"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'last_login_at': user.last_login_at.isoformat() if user.last_login_at else None
    })

@main.route('/api/user/profile', methods=['PUT'])
def update_user_profile():
    """Update user profile"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.json
    if 'name' in data:
        user.name = data['name']
    
    db.session.commit()
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'last_login_at': user.last_login_at.isoformat() if user.last_login_at else None
    })

@main.route('/api/address', methods=['GET'])
def get_address():
    """Get user's current address"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    address = Address.query.filter_by(user_email=session['email'], last_address=None).first()
    if not address:
        address = Address.query.filter_by(user_email=session['email']).first()
    
    if not address:
        return jsonify({'error': 'Address not found'}), 404
    
    return jsonify({
        'address_id': address.address_id,
        'user_email': address.user_email,
        'google_maps': address.google_maps,
        'address': address.address,
        'postal_code': address.postal_code,
        'city': address.city,
        'state': address.state,
        'last_address': address.last_address
    })

@main.route('/api/address', methods=['POST'])
def create_address():
    """Create new address"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    new_address = Address(
        user_email=session['email'],
        google_maps=data.get('google_maps'),
        address=data['address'],
        postal_code=data.get('postal_code'),
        city=data.get('city'),
        state=data.get('state')
    )
    
    db.session.add(new_address)
    db.session.commit()
    
    return jsonify({
        'address_id': new_address.address_id,
        'user_email': new_address.user_email,
        'google_maps': new_address.google_maps,
        'address': new_address.address,
        'postal_code': new_address.postal_code,
        'city': new_address.city,
        'state': new_address.state,
        'last_address': new_address.last_address
    }), 201

@main.route('/api/orders', methods=['GET'])
def get_orders():
    """Get user's orders"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    orders = Order.query.filter_by(user_email=session['email']).order_by(Order.date.desc()).all()
    biowaste_orders = BioWasteOrder.query.filter_by(user_email=session['email']).order_by(BioWasteOrder.date.desc()).all()
    
    # Combine and format orders
    all_orders = []
    for order in orders:
        all_orders.append({
            'order_id': order.order_id,
            'date': order.date.isoformat(),
            'user_email': order.user_email,
            'address_id': order.address_id,
            'contact_number': order.contact_number,
            'description': order.description,
            'images': order.images,
            'waste_type': order.waste_type
        })
    
    for order in biowaste_orders:
        all_orders.append({
            'order_id': order.order_id,
            'date': order.date.isoformat(),
            'user_email': order.user_email,
            'address_id': order.address_id,
            'contact_number': order.contact_number,
            'description': order.description,
            'images': order.images,
            'waste_type': 'biowaste',
            'bio_waste_category': order.bio_waste_category,
            'quantity': order.quantity,
            'unit': order.unit,
            'special_instructions': order.special_instructions
        })
    
    # Sort by date
    all_orders.sort(key=lambda x: x['date'], reverse=True)
    
    return jsonify(all_orders)

@main.route('/api/orders/e-waste', methods=['POST'])
def create_ewaste_order():
    """Create e-waste order"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Get user's current address
    address = Address.query.filter_by(user_email=session['email'], last_address=None).first()
    if not address:
        address = Address.query.filter_by(user_email=session['email']).first()
    
    if not address:
        return jsonify({'error': 'Address not found. Please add an address first.'}), 400
    
    try:
        contact_number = request.form.get('contact_number', '').strip()
        description = request.form.get('description', '').strip()
        
        if not contact_number:
            return jsonify({'error': 'Contact number is required'}), 400
        
        # Handle file uploads
        images = []
        if 'images' in request.files:
            uploaded_files = request.files.getlist('images')
            for file in uploaded_files:
                if file and file.filename:
                    file.seek(0, 2)
                    file_size = file.tell()
                    file.seek(0)
                    
                    if file_size > 5 * 1024 * 1024:
                        return jsonify({'error': f'File {file.filename} is too large. Maximum size is 5MB.'}), 400
                    
                    file_content = file.read()
                    base64_string = base64.b64encode(file_content).decode('utf-8')
                    images.append(base64_string)
        
        # Create new order
        new_order = Order(
            user_email=session['email'],
            address_id=address.address_id,
            contact_number=contact_number,
            description=description,
            images=images if images else None,
            waste_type='e-waste'
        )
        
        db.session.add(new_order)
        db.session.commit()
        
        # Send WhatsApp notification
        admin_number = os.getenv('WHATSAPP_ADMIN_NUMBER')
        if admin_number:
            msg = (
                f"New E-Waste Pickup Scheduled!\n"
                f"User: {session['email']}\n"
                f"Contact: {contact_number}\n"
                f"Address: {address.address}, {address.city}, {address.state}, {address.postal_code}\n"
                f"Description: {description}"
            )
            try:
                send_whatsapp_message(admin_number, msg)
                logger.info(f"✅ WhatsApp notification sent to {admin_number}")
            except Exception as e:
                logger.error(f"❌ Failed to send WhatsApp message: {str(e)}")
        
        return jsonify({
            'order_id': new_order.order_id,
            'date': new_order.date.isoformat(),
            'user_email': new_order.user_email,
            'address_id': new_order.address_id,
            'contact_number': new_order.contact_number,
            'description': new_order.description,
            'images': new_order.images,
            'waste_type': new_order.waste_type
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error creating e-waste order: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create order'}), 500

@main.route('/api/orders/biowaste', methods=['POST'])
def create_biowaste_order():
    """Create biowaste order"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Get user's current address
    address = Address.query.filter_by(user_email=session['email'], last_address=None).first()
    if not address:
        address = Address.query.filter_by(user_email=session['email']).first()
    
    if not address:
        return jsonify({'error': 'Address not found. Please add an address first.'}), 400
    
    try:
        contact_number = request.form.get('contact_number', '').strip()
        description = request.form.get('description', '').strip()
        bio_waste_category = request.form.get('bio_waste_category', '').strip()
        quantity = float(request.form.get('quantity', 0))
        unit = request.form.get('unit', '').strip()
        special_instructions = request.form.get('special_instructions', '').strip()
        
        if not contact_number:
            return jsonify({'error': 'Contact number is required'}), 400
        if not bio_waste_category:
            return jsonify({'error': 'Bio-waste category is required'}), 400
        if quantity <= 0:
            return jsonify({'error': 'Quantity must be positive'}), 400
        if not unit:
            return jsonify({'error': 'Unit is required'}), 400
        
        # Handle file uploads
        images = []
        if 'images' in request.files:
            uploaded_files = request.files.getlist('images')
            for file in uploaded_files:
                if file and file.filename:
                    file.seek(0, 2)
                    file_size = file.tell()
                    file.seek(0)
                    
                    if file_size > 5 * 1024 * 1024:
                        return jsonify({'error': f'File {file.filename} is too large. Maximum size is 5MB.'}), 400
                    
                    file_content = file.read()
                    base64_string = base64.b64encode(file_content).decode('utf-8')
                    images.append(base64_string)
        
        # Create new biowaste order
        new_order = BioWasteOrder(
            user_email=session['email'],
            address_id=address.address_id,
            contact_number=contact_number,
            description=description,
            images=images if images else None,
            bio_waste_category=bio_waste_category,
            quantity=quantity,
            unit=unit,
            special_instructions=special_instructions
        )
        
        db.session.add(new_order)
        db.session.commit()
        
        # Send WhatsApp notification
        admin_number = os.getenv('WHATSAPP_ADMIN_NUMBER')
        if admin_number:
            msg = (
                f"New Bio-Waste Pickup Scheduled!\n"
                f"User: {session['email']}\n"
                f"Contact: {contact_number}\n"
                f"Category: {bio_waste_category}\n"
                f"Quantity: {quantity} {unit}\n"
                f"Address: {address.address}, {address.city}, {address.state}, {address.postal_code}\n"
                f"Description: {description}\n"
                f"Special Instructions: {special_instructions}"
            )
            try:
                send_whatsapp_message(admin_number, msg)
                logger.info(f"✅ WhatsApp notification sent to {admin_number}")
            except Exception as e:
                logger.error(f"❌ Failed to send WhatsApp message: {str(e)}")
        
        return jsonify({
            'order_id': new_order.order_id,
            'date': new_order.date.isoformat(),
            'user_email': new_order.user_email,
            'address_id': new_order.address_id,
            'contact_number': new_order.contact_number,
            'description': new_order.description,
            'images': new_order.images,
            'waste_type': 'biowaste',
            'bio_waste_category': new_order.bio_waste_category,
            'quantity': new_order.quantity,
            'unit': new_order.unit,
            'special_instructions': new_order.special_instructions
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error creating biowaste order: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create order'}), 500
