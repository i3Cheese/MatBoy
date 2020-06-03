from data import User, create_session
import bot.messages as messages


def handler(uid, text, users_info):
    if uid not in users_info.keys():
        users_info[uid] = {}
        messages.welcome_message(uid)
        return
    else:
        if text.lower() not in ('выключить', 'включить'):
            messages.auto_answer(uid)
        else:
            notifications(uid, text.lower())


def notifications(uid, command):
    session = create_session()
    user = session.query(User).filter(User.vk_id == uid).first()
    if not user:
        messages.send_message(uid, 'К сожалению Ваша страница ' \
                                   'ВКонтакте не привязана к аккаунту на сайте')
        return
    if command == 'включить':
        turn_on_notification(uid, user)
    elif command == 'выключить':
        turn_off_notification(uid, user)
    session.commit()


def turn_on_notification(uid, user):
    if user.vk_notifications:
        messages.send_message(uid, 'У Вас уже включены уведомления')
    else:
        user.vk_notifications = True
        messages.send_message(uid, 'Уведомления успешно включены')


def turn_off_notification(uid, user):
    if not user.vk_notifications:
        messages.send_message(uid, 'У Вас отключены уведомления')
    else:
        user.vk_notifications = False
        messages.send_message(uid, 'Уведомления успешно отключены')
