from vk_api.keyboard import VkKeyboard, VkKeyboardColor
from json import dumps


empty_keyboard = dumps({"buttons": [], "one_time": True})

welcome_keyboard = VkKeyboard(one_time=True)
welcome_keyboard.add_button('Включить', color=VkKeyboardColor.POSITIVE)

notification_keyboard = VkKeyboard(one_time=True)
notification_keyboard.add_button('Включить', color=VkKeyboardColor.POSITIVE)
notification_keyboard.add_button('Выключить', color=VkKeyboardColor.NEGATIVE)
