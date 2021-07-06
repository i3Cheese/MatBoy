from flask import flash
from itsdangerous import SignatureExpired, BadSignature, URLSafeTimedSerializer

from server import app


def generate_confirmation_token_reset_password(email):
    """
    Generating a hashed token from email for reset password
    :param email:
    :return: hash
    """
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])


def generate_confirmation_token_reset_email(old_email, new_email):
    """
    Generating a hashed token from email for edit email
    :param old_email:
    :param new_email:
    :return: hash
    """
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    data = {'old_email': old_email, 'new_email': new_email}
    return serializer.dumps(data, salt=app.config['SECURITY_EMAIL_SALT'])


def confirm_token_reset_password(token, expiration=3600):
    """
    Decryption of the token in email with the expiration date in seconds
    :param token:
    :param expiration:
    :return: email
    """
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(
            token,
            salt=app.config['SECURITY_PASSWORD_SALT'],
            max_age=expiration
        )
    except SignatureExpired:
        flash('Срок дейсвия токена истек', 'error')
        return False
    except BadSignature:
        flash('Ошибка проверки подписи', 'error')
        return False
    return email


def confirm_token_edit_email(token, expiration=3600):
    """

    :param token:
    :param expiration:
    :return: Dict('old_email', 'new_email')
    """
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        data = serializer.loads(
            token,
            salt=app.config['SECURITY_EMAIL_SALT'],
            max_age=expiration
        )
    except SignatureExpired:
        flash('Срок дейсвия токена истек', 'error')
        return False
    except BadSignature:
        flash('Ошибка проверки подписи', 'error')
        return False
    return data
