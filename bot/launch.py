from vk_api.bot_longpoll import  VkBotEventType
from bot import LONGPOLL
from bot.utils import handler


USERS_INFO = {}

def bot_launch():
    for event in LONGPOLL.listen():
        if event.type == VkBotEventType.MESSAGE_NEW:
            handler(event.obj.message['from_id'], USERS_INFO)


if __name__ == '__main__':
    bot_launch()