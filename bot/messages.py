from random import randint
from data import User, create_session
from bot import VK_SESSION as vk
from bot import empty_keyboard, welcome_keyboard, notification_keyboard


def send_message(uid, text, keyboard=empty_keyboard):
    vk.messages.send(user_id=uid, 
                     message=text, 
                     random_id=randint(0, 2 ** 64), 
                     keyboard=keyboard)


def welcome_message(uid):
    text = 'Привет! Я буду уведомлять тебя о новостях в турнирах MatBoy.\n'  \
           'Сейчас твои уведомления выключены :(\n'  \
           'Чтобы получать их, отравь слово "Включить"'
    send_message(uid, text, keyboard=welcome_keyboard.get_keyboard())


def auto_answer(uid):
    text = 'Не знаю, что вам написать.\n'  \
           'Вы можете включить или выключить уведомления.\n'
    send_message(uid, text, keyboard=notification_keyboard.get_keyboard())


def invite_message(text, emails):
    session = create_session()
    for email in emails:
        user = session.query(User).filter(User.email == email).first()
        if user.integration_with_VK:
            send_message(user.vk_id, text)
