from flask_mail import Message
from flask import current_app
from app import mail
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        subject = "Your OTP Code - Waste Collection Service"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }}
                .otp-code {{ 
                    background-color: #ffffff; 
                    border: 2px solid #10b981; 
                    border-radius: 8px; 
                    padding: 20px; 
                    text-align: center; 
                    font-size: 32px; 
                    font-weight: bold; 
                    color: #10b981; 
                    margin: 20px 0; 
                    letter-spacing: 4px;
                }}
                .warning {{ 
                    background-color: #fff3cd; 
                    border: 1px solid #ffeaa7; 
                    border-radius: 4px; 
                    padding: 15px; 
                    margin: 20px 0; 
                    color: #856404; 
                }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌱 Waste Collection Service</h1>
                </div>
                <div class="content">
                    <h2>Your OTP Code</h2>
                    <p>Hello!</p>
                    <p>You requested an OTP to access your waste collection service account.</p>
                    <p>Your OTP code is:</p>
                    <div class="otp-code">{otp_code}</div>
                    <p>This code will expire in <strong>5 minutes</strong>.</p>
                    <div class="warning">
                        <strong>Security Notice:</strong> If you didn't request this code, please ignore this email.
                    </div>
                    <p>Thank you for choosing our eco-friendly waste collection service!</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>Waste Collection Service Team</p>
                    <p>🌱 Making waste disposal responsible and convenient</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Hello!
        
        You requested an OTP to access your waste collection service account.
        
        Your OTP code is: {otp_code}
        
        This code will expire in 5 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Thank you for choosing our eco-friendly waste collection service!
        
        Best regards,
        Waste Collection Service Team
        """
        
        msg = Message(
            subject=subject,
            recipients=[email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@wastecollection.com')
        )
        msg.body = text_body
        msg.html = html_body
        
        mail.send(msg)
        logger.info(f"OTP email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        return False

def send_booking_confirmation_email(email: str, booking_data: dict) -> bool:
    """
    Send booking confirmation email
    Args:
        email: Recipient email address
        booking_data: Booking information
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        subject = f"Booking Confirmed - {booking_data['waste_category'].title()} Pickup"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }}
                .booking-details {{ background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Booking Confirmed</h1>
                </div>
                <div class="content">
                    <h2>Your {booking_data['waste_category'].title()} Pickup is Scheduled</h2>
                    <p>Hello {booking_data.get('user_name', 'there')}!</p>
                    <p>Your waste pickup has been successfully scheduled. Here are the details:</p>
                    
                    <div class="booking-details">
                        <h3>Booking Details:</h3>
                        <p><strong>Booking ID:</strong> #{booking_data['id']}</p>
                        <p><strong>Waste Category:</strong> {booking_data['waste_category'].title()}</p>
                        <p><strong>Waste Types:</strong> {', '.join(booking_data['waste_types'])}</p>
                        <p><strong>Quantity:</strong> {booking_data['quantity']}</p>
                        <p><strong>Pickup Date:</strong> {booking_data['pickup_date']}</p>
                        <p><strong>Status:</strong> {booking_data['status'].title()}</p>
                    </div>
                    
                    <p>Our team will contact you before the scheduled pickup time to confirm the visit.</p>
                    <p>Thank you for choosing our eco-friendly waste collection service!</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>Waste Collection Service Team</p>
                    <p>🌱 Making waste disposal responsible and convenient</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        msg = Message(
            subject=subject,
            recipients=[email],
            sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@wastecollection.com')
        )
        msg.html = html_body
        
        mail.send(msg)
        logger.info(f"Booking confirmation email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send booking confirmation email to {email}: {str(e)}")
        return False 