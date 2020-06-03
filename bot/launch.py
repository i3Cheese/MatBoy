import vk_api
from vk_api.bot_longpoll import VkBotLongPoll, VkBotEventType
from config import config
from bot.utils import handler


USERS_INFO = {}

def bot_launch():
    vk_session = vk_api.VkApi(token=config.ACCESS_TOKEN)

    longpoll = VkBotLongPoll(vk_session, config.VK_GROUP_ID)

    for event in longpoll.listen():
        if event.type == VkBotEventType.MESSAGE_NEW:
            handler(vk_session.get_api(), event.obj.message['from_id'], USERS_INFO)


if __name__ == '__main__':
    bot_launch()