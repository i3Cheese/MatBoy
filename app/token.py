from flask import flash
from itsdangerous import URLSafeSerializer, SignatureExpired, BadSignature, URLSafeTimedSerializer

from app import app


def generate_email_hash(team_id, email):
    """
    Generating a hash string from an email and id team
    :param team_id:
    :param email:
    :return: email hash
    """
    serializer = URLSafeSerializer(app.config['SECRET_KEY'])
    data = {
        'team_id': team_id,
        'email': email
    }
    return serializer.dumps(data)


def confirm_data(hash):
    """
    Decrypting the hash in email and team id
    :param hash:
    :return: dict
    """
    serializer = URLSafeSerializer(app.config['SECRET_KEY'])
    try:
        data = serializer.loads(hash)
    except SignatureExpired:
        return False
    except BadSignature:
        return False
    return data


def generate_confirmation_token_reset_password(email):
    """
    Generating a hashed token from email
    :param email:
    :return: hash
    """
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])


def confirm_token(token, expiration=3600):
    """
    Decryption of the token in email with the expiration date in seconds
    :param token:
    :param expiration:
    :return:
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
    except:
        flash('Непредвиденная ошибка проверки токена', 'error')
        return False
    return email
