import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Basic Flask configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///site.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Session configuration
    app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour
    app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production'
    app.config['SESSION_COOKIE_HTTPONLY'] = True

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Initialize email service
    from .utils.emailer import init_mail
    init_mail(app)

    # Register blueprints
    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    # Create database tables with error handling
    with app.app_context():
        try:
            # Ensure instance directory exists
            instance_path = app.instance_path
            if not os.path.exists(instance_path):
                os.makedirs(instance_path, exist_ok=True)
            
            # Create database tables
            db.create_all()
            print(f"✅ Database initialized successfully at {app.config['SQLALCHEMY_DATABASE_URI']}")
        except Exception as e:
            print(f"⚠️  Database initialization warning: {e}")
            print("Database tables will be created when first accessed")

    return app
