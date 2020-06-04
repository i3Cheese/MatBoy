from vk_api.bot_longpoll import  VkBotEventType
from bot import LONGPOLL
from bot.utils import handler
import os


USERS_INFO = {}

def bot_launch():
    os.environ['BOT_WORKING'] = 'working'
    for event in LONGPOLL.listen():
        if event.type == VkBotEventType.MESSAGE_NEW:
            handler(event.obj.message['from_id'], event.obj.message['text'].lower(), USERS_INFO)
