import os


class BaseConfig:
    DATA_BASE = 'db/matboy.db'
    DATA_BASE_URL = 'sqlite:///db/matboy.db?check_same_thread=False'
    APP_CONFIG = {'SECRET_KEY': 'MatBoyIsVeryGoodBoy'}
    API_CONFIG = {'SECRET_KEY': 'MatBoyIsVeryGoodBoy'}
    
    TEMPLATES_FOLDER = os.path.abspath("/templates")
    STATIC_FOLDER = os.path.abspath("/static")
    
    DEBUG = False
    
    DATE_FORMAT = "%d.%m.%Y"


class DebugConfig(BaseConfig):
    DEBUG = True