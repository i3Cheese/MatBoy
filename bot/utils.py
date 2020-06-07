from data import User, Tournament, create_session
import bot.messages as msg
from bot import keyboards as kb
import re
import json

# existing commands
COMMANDS = {'notification': ['turn on', 'turn off'],
            'subscription': ['info', 'unsubscribe', 'subscribe']}


def get_user_tournaments(user, user_info, command=True):
    """
    :param user: User obj.
    :param command: adding info for subscribe commands

    :return: text for message

    Creating a list of user's subscription tournaments
    """
    user_info['tournaments'].clear()  # clearing tournaments dict for command info
    users_tournaments = user.tours_subscribe_vk
    text = 'Список турниров в Ваших подписках:\n'
    for n, tour in enumerate(users_tournaments):
        text += '{}. {}\n'.format(str(n + 1), str(tour))
        # for user-friendly tournament choice
        user_info['tournaments'][str(n + 1)] = tour.id
    if command:  # adding explanatory text if user select command
        text += '\nСледом отправьте номер турнира, который необходимо удалить из подписок.\n' \
                'Если список пуст - отправьте любое число.'
    return text


def get_free_tournaments(user, user_info, session):
    """
    :param user: User obj.
    :param session: database session for getting tournaments

    :return: text for message

    Creating a list of exist tournaments
    """
    user_info['tournaments'].clear()  # clearing tournaments dict for command info
    users_tournaments = user.tours_subscribe_vk
    all_tournaments = session.query(Tournament).all()
    text = 'Список турниров, на которые Вы еще не подписаны:\n'
    n = 1
    for tour in all_tournaments:
        if tour not in users_tournaments:  # if tournament not in user's subscription
            text += '{}. {}\n'.format(str(n), str(tour))
            # for user-friendly tournament choice
            user_info['tournaments'][str(n)] = tour.id
            n += 1
    text += '\nСледом отправьте номер турнира, который необходимо добавить в подписки.\n' \
            'Если список пуст - отправьте любое число.'
    return text


def handler(vk_id, text):
    """
    :param uid: user's id
    :param text: user's text from message
    :param users_info: dict

    :return: None -> exiting the handler

    Handle user's messages (commands)
    """
    with open('vk_info.json', 'r') as f:
        users_info = json.load(f)

    uid = str(vk_id)

    if uid not in users_info:  # bot's greetings to the new user
        # tournaments is a dict for tournaments info which using in subscription commands
        users_info[uid] = {'tournaments': {}, 'command_info': ''}
        with open('vk_info.json', 'w') as f:  # 'cause send_message checks uid
            json.dump(users_info, f, ensure_ascii=False, indent=4)
        msg.welcome_message(uid)
    else:
        session = create_session()
        user = session.query(User).filter(User.vk_id == vk_id).first()
        if not user:  # auto answer for a user without VK integration
            msg.without_integration(uid)
            return
        if text == 'помощь':
            msg.help(uid)
        elif text == 'выход':
            users_info[uid]['command_info'] = ''  # delete command status
            msg.exit_message(uid)
        elif text == 'уведомления' or users_info[uid]['command_info'] == 'notification':
            users_info[uid]['command_info'] = 'notification'  # set command status to the user
            notifications(uid, user, session, text)
        elif text == 'подписка' or users_info[uid]['command_info'] == 'subscription' \
                or (users_info[uid]['command_info'] in COMMANDS['subscription']
                    and re.search(r'\d+', text)):
            if not users_info[uid]['command_info'] or text == 'subscription':
                # set command status to the user
                users_info[uid]['command_info'] = 'subscription'  # subscribe menu
            users_info[uid] = subscribe(uid, user, session, text, users_info[uid])
        else:
            msg.auto_answer(uid)
        # if some command chanched user's info
        with open('vk_info.json', 'w') as f:
            json.dump(users_info, f, ensure_ascii=False, indent=4)
    return


def notifications(uid, user, session, command):
    """
    :param uid: user's id
    :param user: User obj.
    :param session: db session
    :param command: user's command

    :return: None -> exiting

    Handle notification commands
    """
    if command == 'уведомления':
        msg.notifications(uid)  # send message with an explanation
    elif command == 'включить':
        turn_on_notifications(uid, user)
        session.commit()
    elif command == 'выключить':
        turn_off_notifications(uid, user)
        session.commit()
    else:
        msg.auto_answer(uid)
    return


def subscribe(uid, user, session, command, user_info):
    """
    :param uid: user's id
    :param user: User obj.
    :param session: database session for getting tournaments
    :param command: user's command to handle
    :param user_info: user's session status

    :return: user's command status

    Handle subscribe commands
    """

    if command == 'подписка':
        msg.subscribe(uid)  # send message with an explanation
    elif command == 'информация':
        # showing subscribe tournaments
        msg.send_message(uid, get_user_tournaments(user, user_info, command=False))
        msg.subscribe(uid)
    elif command == 'отписаться':
        user_info['command_info'] = 'unsubscribe'  # set a current subscribe command status
        msg.send_message(uid, get_user_tournaments(user, user_info))
    elif command == 'подписаться':
        user_info['command_info'] = 'subscribe'  # --||--
        msg.send_message(uid, get_free_tournaments(user, user_info, session))
    elif user_info['command_info'] in COMMANDS['subscription']:  # checking a current command
        # handling a current subscribe command
        get_subscribe(uid, user_info['tournaments'], user, session,
                      tour_id=int(command),
                      delete=False if user_info['command_info'] == 'subscribe' else True)
        session.commit()
        user_info['command_info'] = 'subscription'  # set a global subscribe command status
    else:
        msg.auto_answer(uid)
    return user_info


def turn_on_notifications(uid, user):
    """
    :param uid: user's id
    :param user: User obj.

    Handle turning on notifications
    """
    if user.vk_notifications:
        text = 'У Вас уже включены уведомления.'
    else:
        user.vk_notifications = True
        text = 'Уведомления успешно включены.'
    msg.notifications_info(uid, text)


def turn_off_notifications(uid, user):
    """
    :param uid: user's id
    :param user: User obj.

    Handle turning off notifications
    """
    if not user.vk_notifications:
        text = 'У Вас отключены уведомления.'
    else:
        user.vk_notifications = False
        text = 'Уведомления успешно отключены.'
    msg.notifications_info(uid, text)


def get_subscribe(uid, tournaments, user, session, tour_id, delete=True):
    """
    :param uid: user's id
    :param tournaments: user's tournaments from command
    :param user: User obj.
    :param session: database session for getting tournaments
    :param tour_id: tournament's id for subscribe command
    :param delete: need to remove subscription to the tournament or not

    Adding or remove user's subscription to the tournament
    """
    if tour_id > len(tournaments.keys()) or tour_id <= 0:  # checking a correct tournament's id
        msg.send_message(uid, 'Ошибка выполнения. Начните сначала.',
                         keyboard=kb.subscribe_keyboard.get_keyboard())
        return
    # getting tournament for actions
    tour = session.query(Tournament).filter(Tournament.id == tournaments[str(tour_id)]).first()
    if delete:
        if user in tour.users_subscribe_vk:
            tour.users_subscribe_vk.remove(user)
    else:
        if user not in tour.users_subscribe_vk:
            tour.users_subscribe_vk.append(user)
    msg.send_message(uid, 'Команда успешло выполнена.',
                     keyboard=kb.subscribe_keyboard.get_keyboard())
