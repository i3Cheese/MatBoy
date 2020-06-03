from vk_api.keyboard import VkKeyboard, VkKeyboardColor

empty_keyboard = VkKeyboard(one_time=True)

welcome_keyboard = VkKeyboard(one_time=True)
welcome_keyboard.add_button('Включить', color=VkKeyboardColor.POSITIVE)
