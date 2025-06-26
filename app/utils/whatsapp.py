import os
from twilio.rest import Client

def send_whatsapp_message(to_number, message_body):
    """
    Send a WhatsApp message using Twilio API.
    Args:
        to_number (str): Recipient's WhatsApp number (e.g., '+919999999999')
        message_body (str): The message to send
    Returns:
        str: Message SID if sent successfully
    """
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    whatsapp_from = os.getenv('TWILIO_WHATSAPP_FROM')  # e.g., 'whatsapp:+14155238886'
    if not all([account_sid, auth_token, whatsapp_from]):
        raise ValueError('Twilio WhatsApp credentials are not set in environment variables.')
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body=message_body,
        from_=whatsapp_from,
        to=f'whatsapp:{to_number}'
    )
    return message.sid 