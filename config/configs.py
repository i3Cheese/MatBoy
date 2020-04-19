import os
import logging

class BaseConfig:
    DATA_BASE = 'db/matboy.db'
    DATA_BASE_URL = 'sqlite:///db/matboy.db?check_same_thread=False'
    
    APP_CONFIG = {'SECRET_KEY': 'MatBoyIsVeryGoodBoy'}
    APP_PORT = 5000
    API_CONFIG = {'SECRET_KEY': 'MatBoyIsVeryGoodBoy'}
    API_PORT = 5001
    HOST = '127.0.0.1'

    TEMPLATES_FOLDER = os.path.abspath("templates")
    STATIC_FOLDER = os.path.abspath("static")
    ROOT_PATH = os.path.abspath(".")
    JINJA_EXTENSIONS = ['jinja2.ext.loopcontrols']
    
    DEBUG = False
    
    DATE_FORMAT = "%d.%m.%Y"
    
    LOGGING_FILE = "matboy.log"
    LOGGING_LEVEL = logging.WARNING


class DebugConfig(BaseConfig):
    DEBUG = True
    LOGGING_LEVEL = logging.DEBUG