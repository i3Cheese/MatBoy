from flask_mail import Message
from app import app, mail
from config import config


def send_message(msg):
    """Send message on email SMPT"""
    with app.app_context():
        mail.send(msg)


def send_messages(subject, recipients, html, sender=config.MAIL_DEFAULT_SENDER, ):
    """Send emails to all recipients one by one"""
    with app.app_context():
        for recipient in recipients:
            msg = Message(
                subject=subject,
                recipients=[recipient, ],
                sender=sender,
                html=html,
            )
            mail.send(msg)
