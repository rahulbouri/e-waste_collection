from datetime import datetime
from . import db
from sqlalchemy.dialects.postgresql import JSON

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    addresses = db.relationship('Address', back_populates='user', cascade='all, delete-orphan')
    bookings = db.relationship('Booking', back_populates='user', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None
        }

class Address(db.Model):
    __tablename__ = 'addresses'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    address = db.Column(db.String(250), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    city = db.Column(db.String(50), default='Bangalore')
    state = db.Column(db.String(50), default='Karnataka')
    maps_link = db.Column(db.String(500))
    is_current = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', back_populates='addresses')
    bookings = db.relationship('Booking', back_populates='address')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'address': self.address,
            'pincode': self.pincode,
            'city': self.city,
            'state': self.state,
            'maps_link': self.maps_link,
            'is_current': self.is_current,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey('addresses.id', ondelete='SET NULL'))
    
    # Booking details
    waste_category = db.Column(db.String(20), nullable=False)  # 'ewaste' or 'biomedical'
    waste_types = db.Column(JSON, nullable=False)  # Array of selected waste types
    quantity = db.Column(db.String(20), nullable=False)  # e.g., '1-5 kg', '5-10 kg'
    pickup_date = db.Column(db.Date, nullable=False)
    additional_notes = db.Column(db.Text)
    
    # Status tracking
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Images (stored as base64 strings in JSON array)
    images = db.Column(JSON)
    
    # Relationships
    user = db.relationship('User', back_populates='bookings')
    address = db.relationship('Address', back_populates='bookings')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'address_id': self.address_id,
            'waste_category': self.waste_category,
            'waste_types': self.waste_types,
            'quantity': self.quantity,
            'pickup_date': self.pickup_date.isoformat() if self.pickup_date else None,
            'additional_notes': self.additional_notes,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'images_count': len(self.images) if self.images else 0
        }

 