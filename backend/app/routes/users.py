from flask import Blueprint, request, jsonify, session
import re
import logging
from ..models import User, Address, db
from werkzeug.security import generate_password_hash

users_bp = Blueprint('users', __name__)
logger = logging.getLogger(__name__)

def require_auth():
    """Decorator to require authentication"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

def is_valid_bangalore_pincode(pincode):
    """Validate Bangalore pincode format"""
    return re.match(r'^560\d{3}$', pincode) is not None

def is_valid_indian_phone(phone):
    """Validate Indian phone number format"""
    return re.match(r'^\d{10}$', phone) is not None

@users_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    logger.info("Get profile request received")
    
    if 'user_id' not in session:
        logger.warning("Get profile attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        user_id = session['user_id']
        logger.info(f"Fetching profile for user {user_id}")
        
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User {user_id} not found in database")
            session.clear()
            return jsonify({'error': 'User not found'}), 404
        
        # Get current address
        current_address = Address.query.filter_by(user_id=user_id, is_current=True).first()
        
        profile_data = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'phone': user.phone,
            'address': current_address.to_dict() if current_address else None
        }
        
        logger.info(f"Profile data returned for user {user_id}")
        return jsonify(profile_data), 200
        
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    logger.info("Update profile request received")
    
    if 'user_id' not in session:
        logger.warning("Update profile attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    data = request.get_json()
    if not data:
        logger.warning("Update profile request with no data")
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        user_id = session['user_id']
        logger.info(f"Updating profile for user {user_id}")
        
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User {user_id} not found in database")
            session.clear()
            return jsonify({'error': 'User not found'}), 404
        
        # Update user fields
        if 'name' in data:
            user.name = data['name'].strip()
        if 'phone' in data:
            user.phone = data['phone'].strip()
        
        db.session.commit()
        
        logger.info(f"Profile updated successfully for user {user_id}")
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'phone': user.phone
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/addresses', methods=['GET'])
def get_addresses():
    """Get user addresses"""
    logger.info("Get addresses request received")
    
    if 'user_id' not in session:
        logger.warning("Get addresses attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        user_id = session['user_id']
        logger.info(f"Fetching addresses for user {user_id}")
        
        addresses = Address.query.filter_by(user_id=user_id).all()
        
        logger.info(f"Found {len(addresses)} addresses for user {user_id}")
        
        return jsonify({
            'addresses': [address.to_dict() for address in addresses]
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching addresses: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/addresses', methods=['POST'])
def add_address():
    """Add new address"""
    logger.info("Add address request received")
    
    if 'user_id' not in session:
        logger.warning("Add address attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    data = request.get_json()
    if not data:
        logger.warning("Add address request with no data")
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['address', 'pincode']
    for field in required_fields:
        if field not in data:
            logger.warning(f"Add address missing required field: {field}")
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        user_id = session['user_id']
        logger.info(f"Adding address for user {user_id}")
        
        # If this is the first address, make it current
        existing_addresses = Address.query.filter_by(user_id=user_id).count()
        is_current = existing_addresses == 0
        
        address = Address(
            user_id=user_id,
            address=data['address'].strip(),
            pincode=data['pincode'].strip(),
            maps_link=data.get('maps_link', '').strip(),
            is_current=is_current
        )
        
        db.session.add(address)
        db.session.commit()
        
        logger.info(f"Address added successfully with ID: {address.id}")
        
        return jsonify({
            'message': 'Address added successfully',
            'address': address.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Error adding address: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/addresses/<int:address_id>', methods=['PUT'])
def update_address(address_id):
    """Update address"""
    logger.info(f"Update address request for ID: {address_id}")
    
    if 'user_id' not in session:
        logger.warning("Update address attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    data = request.get_json()
    if not data:
        logger.warning("Update address request with no data")
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        user_id = session['user_id']
        address = Address.query.filter_by(id=address_id, user_id=user_id).first()
        
        if not address:
            logger.warning(f"Address {address_id} not found for user {user_id}")
            return jsonify({'error': 'Address not found'}), 404
        
        # Update fields
        if 'address' in data:
            address.address = data['address'].strip()
        if 'pincode' in data:
            address.pincode = data['pincode'].strip()
        if 'maps_link' in data:
            address.maps_link = data['maps_link'].strip()
        
        db.session.commit()
        
        logger.info(f"Address {address_id} updated successfully for user {user_id}")
        
        return jsonify({
            'message': 'Address updated successfully',
            'address': address.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating address {address_id}: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/addresses/<int:address_id>/set-current', methods=['POST'])
def set_current_address(address_id):
    """Set address as current"""
    logger.info(f"Set current address request for ID: {address_id}")
    
    if 'user_id' not in session:
        logger.warning("Set current address attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        user_id = session['user_id']
        address = Address.query.filter_by(id=address_id, user_id=user_id).first()
        
        if not address:
            logger.warning(f"Address {address_id} not found for user {user_id}")
            return jsonify({'error': 'Address not found'}), 404
        
        # Remove current flag from all user addresses
        Address.query.filter_by(user_id=user_id).update({'is_current': False})
        
        # Set this address as current
        address.is_current = True
        db.session.commit()
        
        logger.info(f"Address {address_id} set as current for user {user_id}")
        
        return jsonify({'message': 'Address set as current successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error setting current address {address_id}: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/addresses/<int:address_id>', methods=['DELETE'])
def delete_address(address_id):
    """Delete an address (only if not the only address)"""
    try:
        user = require_auth()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Find the address
        address = Address.query.filter_by(id=address_id, user_id=user.id).first()
        if not address:
            return jsonify({'error': 'Address not found'}), 404
        
        # Check if this is the only address
        if len(user.addresses) == 1:
            return jsonify({'error': 'Cannot delete the only address. Please add another address first.'}), 400
        
        # If this is the current address, set another address as current
        if address.is_current:
            other_address = next(addr for addr in user.addresses if addr.id != address_id)
            other_address.is_current = True
        
        db.session.delete(address)
        db.session.commit()
        
        logger.info(f"✅ Address deleted for user: {user.email}")
        
        return jsonify({'message': 'Address deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"❌ Error in delete_address: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'An error occurred while deleting address'}), 500

@users_bp.route('/stats', methods=['GET'])
def get_user_stats():
    """Get user statistics"""
    logger.info("User stats request received")
    
    if 'user_id' not in session:
        logger.warning("User stats attempt without authentication")
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        user_id = session['user_id']
        logger.info(f"Fetching stats for user {user_id}")
        
        from ..models import Booking
        
        total_bookings = Booking.query.filter_by(user_id=user_id).count()
        completed_bookings = Booking.query.filter_by(user_id=user_id, status='completed').count()
        total_addresses = Address.query.filter_by(user_id=user_id).count()
        
        logger.info(f"Stats for user {user_id}: bookings={total_bookings}, completed={completed_bookings}, addresses={total_addresses}")
        
        return jsonify({
            'total_bookings': total_bookings,
            'completed_bookings': completed_bookings,
            'total_addresses': total_addresses
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching user stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500 