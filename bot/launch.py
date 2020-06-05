from vk_api.bot_longpoll import VkBotEventType
from bot import LONGPOLL
from bot.utils import handler
import os

# dict for storing info about commands
USERS_INFO = {}


def bot_launch():
    """
    Listening events from VK
    If user send a new message - launching conversation handler -> bot send answer
    """
    os.environ['BOT_WORKING'] = 'working'  # create an env for launch once
    for event in LONGPOLL.listen():
        if event.type == VkBotEventType.MESSAGE_NEW:
            handler(event.obj.message['from_id'], event.obj.message['text'].lower(), USERS_INFO)
