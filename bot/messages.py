from random import randint
from data import User, create_session
from bot import VK_SESSION as vk
from bot import empty_keyboard, basic_keyboard, notification_keyboard, subscribe_keyboard
from bot import options_keyboard, options_keyboard_with_help


def send_message(uid, text, keyboard=empty_keyboard):
    vk.messages.send(user_id=uid, 
                     message=text, 
                     random_id=randint(0, 2 ** 64), 
                     keyboard=keyboard)


def welcome_message(uid):
    text = 'Привет! Я буду уведомлять тебя о новостях в турнирах MatBoy.\n'  \
           'Для того, чтобы подробнее ознакомиться в функционалом бота, '  \
           'отправь команду "Помощь"'
    send_message(uid, text, keyboard=basic_keyboard.get_keyboard())


def help(uid):
    text = 'Если Вы напишите "Уведомления", то после этого, можно будет включить или выключить'  \
           'уведомления через ВКонтакте о турнирах, которые находятся у вас в подписках.\n\n'  \
           'Команда "Подписка" позволяет перейти в управление оповещениями о турнирах:\n'  \
           '• Информация - вывод списка турниров, на которые подписан пользователь;\n'  \
           '• Отписаться - выбор турнира из списка, чтобы отписаться от опоывещений о нем;\n'  \
           '• Подписаться - выбор турнира, чтобы добавить его в список подписок.\n\n'  \
           'Для того, чтобы выйти из режима, отправьте "Выход"'
    send_message(uid, text, keyboard=options_keyboard.get_keyboard())


def exit_message(uid):
    text = 'Чтобы продолжить работу, оправьте название одной из команд.'
    send_message(uid, text, keyboard=options_keyboard_with_help.get_keyboard())


def auto_answer(uid):
    text = 'Не знаю, что вам написать.\n'  \
           'Вы можете узнать о моих функциях, отправив "Помощь"'
    send_message(uid, text, keyboard=basic_keyboard.get_keyboard())


def without_integration(uid):
    text = 'К сожалению Ваша страница ' \
           'ВКонтакте не привязана к аккаунту на сайте.\n'  \
           'У Вас нет доступа к функционалу бота.'
    send_message(uid, text)


def notifications(uid):
    text = 'Отправьте "Включить" для того, чтобы получать уведомления о турнирах в подписках;\n'  \
           '"Выключить" - чтобы не получать оповещения о новостях.'
    send_message(uid, text, keyboard=notification_keyboard.get_keyboard())


def notifications_info(uid, text):
    send_message(uid, text, keyboard=notification_keyboard.get_keyboard())


def subscribe(uid):
    text = 'Отправьте "Информация", чтобы посмотреть список подписок на турниры;\n'  \
           '"Подписаться" - чтобы добавить турнир в подписки;\n'  \
           '"Отписаться" - чтобы отписаться от турнира.\n\n'  \
           'В случае, если Вы хотите модифицировать ваши подписки, после выбора ' \
           'соответствующей команды, следом отправьте число - номер турнира в выведеном списке.'
    send_message(uid, text, keyboard=subscribe_keyboard.get_keyboard())


def invite_message(text, emails: list):
    session = create_session()
    for email in emails:
        user = session.query(User).filter(User.email == email).first()
        if user.integration_with_VK:
            send_message(user.vk_id, text)
