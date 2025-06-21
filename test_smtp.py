#!/usr/bin/env python3
"""
SMTP Test Script to debug email configuration.
This script is now more verbose and handles both SSL and TLS connections.
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def test_smtp_connection():
    """Test SMTP connection and authentication with detailed debugging."""
    print("🧪 Testing SMTP Configuration...")
    print("=" * 50)
    
    # Get email configuration from environment variables
    mail_server = os.getenv('MAIL_SERVER')
    mail_port_str = os.getenv('MAIL_PORT')
    mail_username = os.getenv('MAIL_USERNAME')
    mail_password = os.getenv('MAIL_PASSWORD')
    
    print(f"Loaded from .env -> SERVER: {mail_server}, PORT: {mail_port_str}, USER: {mail_username}")

    if not all([mail_server, mail_port_str, mail_username, mail_password]):
        print("\n❌ Critical Error: One or more environment variables are not set.")
        print("Please ensure MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, and MAIL_PASSWORD are in your .env file.")
        return False
        
    mail_port = int(mail_port_str)
    
    print(f"🔒 Mail Password: {'*' * len(mail_password)}")
    print("-" * 50)
    
    server = None
    try:
        # --- Step 1: Establish Connection ---
        print(f"🔗 Step 1: Connecting to {mail_server} on port {mail_port}...")
        
        if mail_port == 465:
            print("INFO: Port 465 detected, using SMTP_SSL (Implicit SSL).")
            server = smtplib.SMTP_SSL(mail_server, mail_port, timeout=10)
        elif mail_port == 587:
            print("INFO: Port 587 detected, using SMTP with STARTTLS (Explicit TLS).")
            server = smtplib.SMTP(mail_server, mail_port, timeout=10)
        else:
            print(f"WARNING: Port {mail_port} is non-standard. Trying standard SMTP.")
            server = smtplib.SMTP(mail_server, mail_port, timeout=10)

        server.set_debuglevel(1)  # Enable verbose debug output
        print("✅ Connection established.")

        # --- Step 2: Handshake and Start TLS (if needed) ---
        if mail_port != 465:
            print("\n👋 Step 2: Sending EHLO and starting TLS...")
            server.ehlo()
            server.starttls()
            server.ehlo() # Re-send EHLO after starting TLS
            print("✅ TLS negotiation successful.")
        else:
            print("\n👋 Step 2: Skipped (SSL connection is secure from start).")

        # --- Step 3: Authentication ---
        print(f"\n🔑 Step 3: Authenticating as user '{mail_username}'...")
        server.login(mail_username, mail_password)
        print("✅ SMTP authentication successful!")
        
        # --- Step 4: Send Test Email ---
        print("\n📤 Step 4: Sending a test email...")
        msg = MIMEMultipart()
        msg['From'] = mail_username
        msg['To'] = mail_username  # Send to yourself for testing
        msg['Subject'] = "✅ SMTP Test Successful - OTP Service"
        
        body = "This is a test email from your OTP service.\n\nIf you received this, your SMTP configuration is working correctly!"
        msg.attach(MIMEText(body, 'plain'))
        
        server.sendmail(mail_username, mail_username, msg.as_string())
        print("✅ Test email sent successfully!")
        
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"\n❌ SMTP Authentication Failed (Code: {e.smtp_code}): {e.smtp_error.decode()}")
        print("\n🔧 Troubleshooting Tips:")
        print("   1. Verify MAIL_PASSWORD in .env is correct. For Gmail, it MUST be an App Password.")
        print("   2. Ensure 2-Step Verification is ON for your Google Account.")
        print("   3. Check that the App Password was generated for 'Mail' on 'Other (Custom name)'.")
        return False
        
    except smtplib.SMTPException as e:
        print(f"\n❌ A general SMTP error occurred: {e}")
        return False
        
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")
        return False
    
    finally:
        if server:
            print("\n🚪 Closing connection.")
            server.quit()

def show_gmail_instructions():
    """Instructions for Gmail App Password setup."""
    print("\n📋 Gmail App Password Setup Instructions:")
    print("=" * 50)
    print("1. Go to your Google Account: https://myaccount.google.com/")
    print("2. Navigate to the 'Security' tab.")
    print("3. Under 'How you sign in to Google', ensure '2-Step Verification' is ON.")
    print("4. Click on 'App passwords'. You may need to sign in again.")
    print("5. In 'Select app', choose 'Mail'.")
    print("6. In 'Select device', choose 'Other (Custom name)', give it a name like 'VentureApp', and click GENERATE.")
    print("7. Copy the 16-character password (without spaces) and paste it into your .env file as MAIL_PASSWORD.")
    print("=" * 50)

if __name__ == "__main__":
    is_successful = test_smtp_connection()
    
    print("\n" + "="*50)
    if is_successful:
        print("🎉 SMTP configuration is working correctly!")
        print("Your application should now be able to send emails.")
    else:
        print("⚠️  SMTP configuration test failed.")
        show_gmail_instructions()
    print("="*50) 