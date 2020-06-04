from data import User, Tournament, create_session
import bot.messages as msg
from bot import keyboards as kb
import re


COMMANDS = {'уведомления': ['включить', 'выключить'], 
            'подписка': ['информация', 'отписаться', 'подписаться'],
            'помощь': [],
            'выход': []}
tournaments = {}

def get_user_tournaments(user):
    tournaments.clear()
    users_tournaments = user.tours_subscribe_vk
    text = 'Список турниров в Ваших подписках:\n'
    for n, tour in enumerate(users_tournaments):
        text += '{}. {}\n'.format(str(n + 1), str(tour))
        tournaments[n + 1] = tour.id
    text += '\nСледом отправьте номер турнира, который необходимо удалить из подписок.\n'  \
            'Если список пусть - отправьте любое число.'
    return text


def get_free_tournaments(user, session):
    tournaments.clear()
    users_tournaments = user.tours_subscribe_vk
    all_tournaments = session.query(Tournament).all()
    text = 'Список турниров, на которые Вы еще не подписаны:\n'
    for n, tour in enumerate(all_tournaments):
        if tour not in users_tournaments:
            text += '{}. {}\n'.format(str(n + 1), str(tour))
            tournaments[n + 1] = tour.id
    text += '\nСледом отправьте номер турнира, который необходимо добавить в подписки.\n'  \
            'Если список пусть - отправьте любое число.'
    return text


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
        elif text == 'подписка' or users_info[uid] == 'подписка'  \
             or (users_info[uid] in COMMANDS['подписка'] and re.search(r'\d+', text)):
            if not users_info[uid]: users_info[uid] = 'подписка'
            users_info[uid] = subscribe(uid, user, session, text, users_info[uid])
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


def subscribe(uid, user, session, command, user_status):
    if command == 'подписка':
        msg.subscribe(uid)
    elif command == 'информация':
        msg.send_message(uid, get_user_tournaments(user))
        msg.subscribe(uid)
    elif command == 'отписаться':
        user_status = 'отписаться'
        msg.send_message(uid, get_user_tournaments(user))
    elif command == 'подписаться':
        user_status = 'подписаться'
        msg.send_message(uid, get_free_tournaments(user, session))
    elif user_status in COMMANDS['подписка']:
        get_subscribe(uid, user, session, 
                      tour_id=int(command), 
                      delete=False if user_status == 'подписаться' else True)
        user_status = 'подписка'
    else:
        msg.auto_answer(uid)
    return user_status


def turn_on_notification(uid, user):
    if user.vk_notifications:
        text = 'У Вас уже включены уведомления.'
    else:
        user.vk_notifications = True
        text = 'Уведомления успешно включены.'
    msg.notifications_info(uid, text)


def turn_off_notification(uid, user):
    if not user.vk_notifications:
        text ='У Вас отключены уведомления.'
    else:
        user.vk_notifications = False
        text = 'Уведомления успешно отключены.'
    msg.notifications_info(uid, text)


def get_subscribe(uid, user, session, tour_id, delete=True):
    if tour_id > len(tournaments.keys()):
        msg.send_message(uid, 'Ошибка выполнения. Начните сначала.', 
                         keyboard=kb.subscribe_keyboard)
        return
    tour = session.query(Tournament).filter(Tournament.id == tournaments[tour_id]).first()
    if delete:
        if user in tour.users_subscribe_vk:
            tour.users_subscribe_vk.remove(user)
    else:
        if user not in tour.users_subscribe_vk:
            tour.users_subscribe_vk.append(user)
    msg.send_message(uid, 'Команда успешло выполнена.', 
                     keyboard=kb.subscribe_keyboard.get_keyboard())