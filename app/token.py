from flask import url_for, render_template, flash
from itsdangerous import URLSafeSerializer, SignatureExpired, BadSignature

from app import app
from config import config


def generate_email_hash(team_id, email):
    serializer = URLSafeSerializer(app.config['SECRET_KEY'])
    data = {
        'team_id': team_id,
        'email': email
    }
    return serializer.dumps(data)


def confirm_data(hash):
    serializer = URLSafeSerializer(app.config['SECRET_KEY'])
    try:
        data = serializer.loads(hash)
    except SignatureExpired:
        return False
    except BadSignature:
        return False
    return data