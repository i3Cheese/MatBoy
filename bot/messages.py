from random import randint


def send_message(vk, uid, text):
    vk.messages.send(user_id=uid, message=text, random_id=randint(0, 2 ** 64))


def welcome_message(session, uid):
    send_message(session, uid, 'Привки!!')