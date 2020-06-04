from vk_api.keyboard import VkKeyboard, VkKeyboardColor
from json import dumps
from copy import deepcopy


empty_keyboard = dumps({"buttons": [], "one_time": True})

basic_keyboard = VkKeyboard(one_time=True)
basic_keyboard.add_button('Помощь', color=VkKeyboardColor.PRIMARY)

notification_keyboard = VkKeyboard(one_time=True)
notification_keyboard.add_button('Включить', color=VkKeyboardColor.POSITIVE)
notification_keyboard.add_button('Выключить', color=VkKeyboardColor.NEGATIVE)
notification_keyboard.add_button('Выход', color=VkKeyboardColor.DEFAULT)

options_keyboard = VkKeyboard(one_time=True)
options_keyboard.add_button('Уведомления', color=VkKeyboardColor.PRIMARY)
options_keyboard.add_button('Подписка', color=VkKeyboardColor.DEFAULT)

options_keyboard_with_help = deepcopy(options_keyboard)
options_keyboard_with_help.add_button('Помощь', color=VkKeyboardColor.PRIMARY)
