from . import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'user'

    id        = db.Column(db.Integer, primary_key=True, unique=True)
    email     = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name      = db.Column(db.String(120))
    last_submitted_form_data = db.Column(db.JSON)
    created_at   = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_login_at = db.Column(db.DateTime)

    # relationships
    addresses = db.relationship('Address', back_populates='user', lazy='dynamic')
    orders    = db.relationship('Order',   back_populates='user',  lazy='dynamic')


class Address(db.Model):
    __tablename__ = 'address'

    address_id   = db.Column(db.Integer, primary_key=True, unique=True)
    user_email   = db.Column(
        db.String(120),
        db.ForeignKey('user.email', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    google_maps  = db.Column(db.String(2083))  # max URL length
    address      = db.Column(db.String(500), nullable=False)
    postal_code  = db.Column(db.String(6))
    city         = db.Column(db.String(20))
    state        = db.Column(db.String(20))

    # relationships
    user   = db.relationship('User', back_populates='addresses')
    orders = db.relationship('Order', back_populates='address', lazy='dynamic')
    last_address = db.Column(db.Integer, db.ForeignKey('address.address_id'))


class Order(db.Model):
    __tablename__ = 'order'

    order_id     = db.Column(db.Integer, primary_key=True, unique=True)
    date         = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_email   = db.Column(
        db.String(120),
        db.ForeignKey('user.email', ondelete='SET NULL'),
        nullable=False,
        index=True
    )
    address_id   = db.Column(
        db.Integer,
        db.ForeignKey('address.address_id', ondelete='SET NULL'),
        nullable=False
    )
    contact_number = db.Column(db.String(10), nullable=False)
    description  = db.Column(db.Text)     # optional, Text for longer descriptions
    images       = db.Column(db.JSON)     # store list of image URLs/paths

    # relationships
    user    = db.relationship('User',    back_populates='orders')
    address = db.relationship('Address', back_populates='orders')
