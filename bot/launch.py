from vk_api.bot_longpoll import VkBotEventType
from bot import LONGPOLL
from bot.utils import handler
import logging
import os


def bot_launch():
    """
    Listening events from VK
    If user send a new message - launching conversation handler -> bot send answer
    """
    with open('vk_info.json', 'w+') as f:  # file for storing user's info
        if not f.read():
            f.write('{}')
    os.environ['BOT_WORKING'] = 'working'  # create an env for launch once
    for event in LONGPOLL.listen():
        if event.type == VkBotEventType.MESSAGE_NEW:
            logging.info('Bot received a new message')
            handler(event.obj.message['from_id'], event.obj.message['text'].lower())
