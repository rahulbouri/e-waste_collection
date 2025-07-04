from flask import Blueprint, request, jsonify, session
from datetime import datetime, date
import base64
import logging
from ..models import Booking, User, Address, db
from ..utils.emailer import send_booking_confirmation_email
import os

bookings_bp = Blueprint('bookings', __name__)
logger = logging.getLogger(__name__)

def require_auth():
    """Decorator to require authentication"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@bookings_bp.route('/', methods=['OPTIONS'])
def handle_options():
    """Handle OPTIONS request for CORS preflight"""
    response = jsonify({'message': 'OK'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

@bookings_bp.route('/', methods=['POST'])
def create_booking():
    """Create a new waste pickup booking"""
    logger.info("Booking creation request received")
    
    if 'user_id' not in session:
        logger.warning("Booking creation attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    data = request.get_json()
    if not data:
        logger.warning("Booking creation request with no data")
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['waste_category', 'waste_types', 'quantity', 'pickup_date']
    for field in required_fields:
        if field not in data:
            logger.warning(f"Booking creation missing required field: {field}")
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        user_id = session['user_id']
        logger.info(f"Creating booking for user {user_id}")
        
        user = require_auth()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Extract booking data
        waste_category = data.get('waste_category')
        waste_types = data.get('waste_types', [])
        quantity = data.get('quantity')
        pickup_date_str = data.get('pickup_date')
        additional_notes = data.get('additional_notes', '')
        images = data.get('images', [])
        
        # Validate required fields
        if not waste_category or waste_category not in ['ewaste', 'biomedical']:
            return jsonify({'error': 'Valid waste category is required'}), 400
        
        if not waste_types or len(waste_types) == 0:
            return jsonify({'error': 'At least one waste type must be selected'}), 400
        
        if not quantity:
            return jsonify({'error': 'Quantity is required'}), 400
        
        if not pickup_date_str:
            return jsonify({'error': 'Pickup date is required'}), 400
        
        # Parse pickup date
        try:
            pickup_date = datetime.strptime(pickup_date_str, '%Y-%m-%d').date()
            if pickup_date < date.today():
                return jsonify({'error': 'Pickup date cannot be in the past'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid pickup date format'}), 400
        
        # Get user's current address
        current_address = None
        for address in user.addresses:
            if address.is_current:
                current_address = address
                break
        
        if not current_address:
            return jsonify({'error': 'Please add an address before booking pickup'}), 400
        
        # Validate images (if any)
        if images:
            for img in images:
                if not isinstance(img, str) or not img.startswith('data:image/'):
                    return jsonify({'error': 'Invalid image format'}), 400
        
        # Create booking
        booking = Booking(
            user_id=user_id,
            address_id=current_address.id,
            waste_category=waste_category,
            waste_types=waste_types,
            quantity=quantity,
            pickup_date=pickup_date,
            additional_notes=additional_notes,
            images=images if images else None
        )
        
        db.session.add(booking)
        db.session.commit()
        
        # Send confirmation email
        booking_data = {
            'id': booking.id,
            'waste_category': booking.waste_category,
            'waste_types': booking.waste_types,
            'quantity': booking.quantity,
            'pickup_date': booking.pickup_date.strftime('%B %d, %Y'),
            'status': booking.status,
            'user_name': user.name
        }
        
        send_booking_confirmation_email(user.email, booking_data)
        
        logger.info(f"✅ Booking created successfully - ID: {booking.id}, User: {user.email}")
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking': booking.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error in create_booking: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'An error occurred while creating booking'}), 500

@bookings_bp.route('/', methods=['GET'])
def get_user_bookings():
    """Get all bookings for the authenticated user"""
    logger.info("Get bookings request received")
    
    if 'user_id' not in session:
        logger.warning("Get bookings attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        user_id = session['user_id']
        logger.info(f"Fetching bookings for user {user_id}")
        
        # Get query parameters
        status = request.args.get('status')
        waste_category = request.args.get('waste_category')
        
        # Build query
        query = Booking.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        
        if waste_category:
            query = query.filter_by(waste_category=waste_category)
        
        # Order by creation date (newest first)
        bookings = query.order_by(Booking.created_at.desc()).all()
        
        # Convert to dict and include address info
        booking_list = []
        for booking in bookings:
            booking_dict = booking.to_dict()
            if booking.address:
                booking_dict['address'] = booking.address.to_dict()
            booking_list.append(booking_dict)
        
        logger.info(f"Found {len(bookings)} bookings for user {user_id}")
        
        return jsonify({
            'bookings': booking_list,
            'total': len(booking_list)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error in get_user_bookings: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching bookings'}), 500

@bookings_bp.route('/<int:booking_id>', methods=['OPTIONS'])
def handle_booking_options(booking_id):
    """Handle OPTIONS request for specific booking CORS preflight"""
    response = jsonify({'message': 'OK'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

@bookings_bp.route('/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get a specific booking by ID"""
    logger.info(f"Get booking request for ID: {booking_id}")
    
    if 'user_id' not in session:
        logger.warning("Get booking attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        user_id = session['user_id']
        booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
        
        if not booking:
            logger.warning(f"Booking {booking_id} not found for user {user_id}")
            return jsonify({'error': 'Booking not found'}), 404
        
        logger.info(f"Returning booking {booking_id} for user {user_id}")
        
        booking_dict = booking.to_dict()
        if booking.address:
            booking_dict['address'] = booking.address.to_dict()
        
        return jsonify({'booking': booking_dict}), 200
        
    except Exception as e:
        logger.error(f"❌ Error in get_booking: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching booking'}), 500

@bookings_bp.route('/<int:booking_id>', methods=['PUT'])
def update_booking(booking_id):
    """Update a booking (only if status is pending)"""
    logger.info(f"Update booking request for ID: {booking_id}")
    
    if 'user_id' not in session:
        logger.warning("Update booking attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        user_id = session['user_id']
        booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
        
        if not booking:
            logger.warning(f"Booking {booking_id} not found for user {user_id}")
            return jsonify({'error': 'Booking not found'}), 404
        
        if booking.status != 'pending':
            return jsonify({'error': 'Only pending bookings can be updated'}), 400
        
        data = request.get_json()
        
        # Update allowed fields
        if 'pickup_date' in data:
            try:
                pickup_date = datetime.strptime(data['pickup_date'], '%Y-%m-%d').date()
                if pickup_date < date.today():
                    return jsonify({'error': 'Pickup date cannot be in the past'}), 400
                booking.pickup_date = pickup_date
            except ValueError:
                return jsonify({'error': 'Invalid pickup date format'}), 400
        
        if 'additional_notes' in data:
            booking.additional_notes = data['additional_notes']
        
        if 'waste_types' in data:
            booking.waste_types = data['waste_types']
        
        if 'quantity' in data:
            booking.quantity = data['quantity']
        
        booking.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"✅ Booking updated - ID: {booking.id}, User: {user_id}")
        
        return jsonify({
            'message': 'Booking updated successfully',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error in update_booking: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'An error occurred while updating booking'}), 500

@bookings_bp.route('/<int:booking_id>', methods=['DELETE'])
def cancel_booking(booking_id):
    """Cancel a booking (only if status is pending)"""
    logger.info(f"Cancel booking request for ID: {booking_id}")
    
    if 'user_id' not in session:
        logger.warning("Cancel booking attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        user_id = session['user_id']
        booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
        
        if not booking:
            logger.warning(f"Booking {booking_id} not found for user {user_id}")
            return jsonify({'error': 'Booking not found'}), 404
        
        if booking.status != 'pending':
            return jsonify({'error': 'Only pending bookings can be cancelled'}), 400
        
        booking.status = 'cancelled'
        booking.updated_at = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"✅ Booking cancelled - ID: {booking.id}, User: {user_id}")
        
        return jsonify({
            'message': 'Booking cancelled successfully',
            'booking': booking.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error in cancel_booking: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'An error occurred while cancelling booking'}), 500

@bookings_bp.route('/stats', methods=['GET'])
def get_booking_stats():
    """Get booking statistics for the authenticated user"""
    logger.info("Booking stats request received")
    
    if 'user_id' not in session:
        logger.warning("Booking stats attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        user_id = session['user_id']
        logger.info(f"Fetching booking stats for user {user_id}")
        
        # Get all user bookings
        bookings = Booking.query.filter_by(user_id=user_id).all()
        
        # Calculate statistics
        total_bookings = len(bookings)
        pending_bookings = len([b for b in bookings if b.status == 'pending'])
        completed_bookings = len([b for b in bookings if b.status == 'completed'])
        cancelled_bookings = len([b for b in bookings if b.status == 'cancelled'])
        
        ewaste_bookings = len([b for b in bookings if b.waste_category == 'ewaste'])
        biomedical_bookings = len([b for b in bookings if b.waste_category == 'biomedical'])
        
        logger.info(f"Stats for user {user_id}: total={total_bookings}, completed={completed_bookings}, pending={pending_bookings}")
        
        return jsonify({
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'completed_bookings': completed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'ewaste_bookings': ewaste_bookings,
            'biomedical_bookings': biomedical_bookings
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error in get_booking_stats: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching statistics'}), 500 