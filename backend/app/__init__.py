import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_mail import Mail
from dotenv import load_dotenv
import redis

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
redis_client = None

def create_app():
    """Application factory pattern for Flask app"""
    logger.info("Starting Flask application creation...")
    
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['TRAILING_SLASH'] = False
    
    # Database configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL', 
        'postgresql://postgres:password@localhost:5432/waste_collection'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Email configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
    
    # Redis configuration
    app.config['REDIS_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    app.config['REDIS_HOST'] = os.getenv('REDIS_HOST', 'localhost')
    app.config['REDIS_PORT'] = int(os.getenv('REDIS_PORT', 6379))
    app.config['REDIS_PASSWORD'] = os.getenv('REDIS_PASSWORD')
    app.config['REDIS_DB'] = int(os.getenv('REDIS_DB', 0))
    
    # OTP configuration
    app.config['OTP_TTL_SECONDS'] = int(os.getenv('OTP_TTL_SECONDS', 300))
    app.config['OTP_LENGTH'] = int(os.getenv('OTP_LENGTH', 6))
    
    logger.info(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    logger.info(f"Redis URL: {os.getenv('REDIS_URL', 'redis://localhost:6379/0')}")
    logger.info(f"Mail server: {app.config['MAIL_SERVER']}:{app.config['MAIL_PORT']}")
    
    # Initialize extensions
    logger.info("Initializing database...")
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    
    logger.info("Initializing Redis client...")
    global redis_client
    try:
        redis_client = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))
        redis_client.ping()
        logger.info("Redis connection successful")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        redis_client = None
    
    logger.info("Using Flask built-in session support")
    
    logger.info("Initializing CORS...")
    CORS(
        app,
        origins=['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
        supports_credentials=True,
        allow_headers=["*"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        expose_headers=["Content-Type", "Authorization"]
    )
    
    # Register blueprints
    logger.info("Registering blueprints...")
    from .routes.auth import auth_bp
    from .routes.bookings import bookings_bp
    from .routes.users import users_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    
    logger.info("All blueprints registered successfully")
    
    # Health check endpoint
    @app.route('/health')
    @app.route('/api/health')
    def health_check():
        logger.debug("Health check endpoint called")
        return {'status': 'healthy', 'message': 'Waste Collection API is running'}
    
    # Serve static files (frontend)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        # Don't serve API routes as static files
        if path.startswith('api/'):
            return {'error': 'Not found'}, 404
        
        # Serve static files from /app/static
        import os
        static_dir = '/app/static'
        
        # If path is empty, serve index.html
        if not path:
            path = 'index.html'
        
        # Check if file exists
        file_path = os.path.join(static_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            from flask import send_from_directory
            return send_from_directory(static_dir, path)
        
        # For SPA routing, serve index.html for all non-API routes
        if os.path.exists(os.path.join(static_dir, 'index.html')):
            from flask import send_from_directory
            return send_from_directory(static_dir, 'index.html')
        
        return {'error': 'Not found'}, 404
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        logger.warning(f"404 error: {error}")
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 error: {error}")
        return {'error': 'Internal server error'}, 500
    
    logger.info("Flask application created successfully!")
    return app 