import vk_api
from vk_api.bot_longpoll import VkBotLongPoll
from config import config

# initialization VK bot
vk_session = vk_api.VkApi(token=config.ACCESS_TOKEN)
try:
    LONGPOLL = VkBotLongPoll(vk_session, config.VK_GROUP_ID)

    # static session for bot's work
    VK_SESSION = vk_session.get_api()

    from .keyboards import *
    from .launch import *
    from .utils import *
    from .messages import *
except Exception:
    pass
