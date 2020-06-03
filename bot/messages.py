from random import randint
from data import User, create_session
from bot import VK_SESSION as vk


def send_message(uid, text):
    vk.messages.send(user_id=uid, message=text, random_id=randint(0, 2 ** 64))


def welcome_message(uid):
    send_message(uid, 'Привки!!')


def invite_message(text, emails):
    session = create_session()
    for email in emails:
        user = session.query(User).filter(User.email == email).first()
        if user.integration_with_VK:
            send_message(user.vk_id, text)
