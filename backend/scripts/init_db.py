#!/usr/bin/env python3
"""
Database initialization script for Waste Collection Service
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import User, Address, Booking

def init_database():
    """Initialize the database with tables"""
    app = create_app()
    
    with app.app_context():
        print("🗄️  Creating database tables...")
        
        # Create all tables
        db.create_all()
        
        print("✅ Database tables created successfully!")
        
        # Check if tables were created
        tables = db.inspect(db.engine).get_table_names()
        print(f"📋 Created tables: {', '.join(tables)}")

if __name__ == '__main__':
    init_database() 