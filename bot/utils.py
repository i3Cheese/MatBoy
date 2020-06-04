from data import User, create_session
import bot.messages as msg
from bot import keyboards as kb


COMMANDS = {'уведомления': ['включить', 'выключить'], 
            'подписка': ['информация', 'отписаться', 'подписаться'],
            'помощь': [],
            'выход': []}

def handler(uid, text, users_info):
    if uid not in users_info.keys():
        users_info[uid] = ''
        msg.welcome_message(uid)
        return
    else:
        session = create_session()
        user = session.query(User).filter(User.vk_id == uid).first()
        if not user:
            msg.without_integration(uid)
            return
        if text == 'помощь':
            msg.help(uid)
        elif text == 'выход':
            users_info[uid] = ''
            msg.exit_message(uid)
        elif text == 'уведомления' or users_info[uid] == 'уведомления': 
            users_info[uid] = 'уведомления'
            notifications(uid, user, text)
            session.commit()
        else:
            msg.auto_answer(uid)
        return


def notifications(uid, user, command):
    if command == 'уведомления':
        msg.notifications(uid)
    elif command == 'включить':
        turn_on_notification(uid, user)
    elif command == 'выключить':
        turn_off_notification(uid, user)
    else:
        msg.auto_answer(uid)
    return


def turn_on_notification(uid, user):
    if user.vk_notifications:
        text = 'У Вас уже включены уведомления'
    else:
        user.vk_notifications = True
        text = 'Уведомления успешно включены'
    msg.notifications_info(uid, text)


def turn_off_notification(uid, user):
    if not user.vk_notifications:
        text ='У Вас отключены уведомления'
    else:
        user.vk_notifications = False
        text = 'Уведомления успешно отключены'
    msg.notifications_info(uid, text)
