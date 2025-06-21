from flask_mail import Mail, Message
from flask import current_app
from .config import Config
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask-Mail
mail = Mail()

def init_mail(app):
    """Initialize Flask-Mail with the app"""
    app.config['MAIL_SERVER'] = Config.MAIL_SERVER
    app.config['MAIL_PORT'] = Config.MAIL_PORT
    app.config['MAIL_USE_TLS'] = Config.MAIL_USE_TLS
    app.config['MAIL_USE_SSL'] = Config.MAIL_USE_SSL
    app.config['MAIL_USERNAME'] = Config.MAIL_USERNAME
    app.config['MAIL_PASSWORD'] = Config.MAIL_PASSWORD
    
    mail.init_app(app)

def send_otp_email(email: str, otp_code: str) -> bool:
    """
    Send OTP email to user
    Args:
        email: Recipient email address
        otp_code: OTP code to send
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        subject = "Your OTP Code"
        body = f"""
        Hello!
        
        Your OTP code is: {otp_code}
        
        This code will expire in 5 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        Your App Team
        """
        
        msg = Message(
            subject=subject,
            recipients=[email],
            body=body,
            sender=email  # Use user's email as sender
        )
        
        mail.send(msg)
        logger.info(f"OTP email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        return False

def send_otp_email_html(email: str, otp_code: str) -> bool:
    """
    Send OTP email with HTML formatting
    Args:
        email: Recipient email address
        otp_code: OTP code to send
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        subject = "Your OTP Code"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .otp-code {{ 
                    background-color: #f8f9fa; 
                    border: 2px solid #dee2e6; 
                    border-radius: 8px; 
                    padding: 15px; 
                    text-align: center; 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #495057; 
                    margin: 20px 0; 
                }}
                .warning {{ 
                    background-color: #fff3cd; 
                    border: 1px solid #ffeaa7; 
                    border-radius: 4px; 
                    padding: 10px; 
                    margin: 20px 0; 
                    color: #856404; 
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Your OTP Code</h2>
                <p>Hello!</p>
                <p>Your OTP code is:</p>
                <div class="otp-code">{otp_code}</div>
                <p>This code will expire in <strong>5 minutes</strong>.</p>
                <div class="warning">
                    <strong>Security Notice:</strong> If you didn't request this code, please ignore this email.
                </div>
                <p>Best regards,<br>Your App Team</p>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Hello!
        
        Your OTP code is: {otp_code}
        
        This code will expire in 5 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        Your App Team
        """
        
        msg = Message(
            subject=subject,
            recipients=[email],
            sender=email  # Use user's email as sender
        )
        msg.body = text_body
        msg.html = html_body
        
        mail.send(msg)
        logger.info(f"OTP email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        return False
