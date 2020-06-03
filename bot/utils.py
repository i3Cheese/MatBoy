from data import User, create_session
import bot.messages as messages


def handler(uid, users_info):
    if uid not in users_info.keys():
        users_info[uid] = {}
        messages.welcome_message(uid)
        return
