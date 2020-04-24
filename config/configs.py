import os
import logging
import locale


class BaseConfig:
    """
    Contains config constants.
    
    Call .setup() at the begging of the program.
    """
    
    DATA_BASE = 'db/matboy.db'
    DATA_BASE_URL = 'sqlite:///'+os.path.abspath('db/matboy.db') + '?check_same_thread=False'
    
    APP_CONFIG = {'SECRET_KEY': 'MatBoyIsVeryGoodBoy'}
    APP_PORT = 5000
    HOST = '127.0.0.1'

    TEMPLATES_FOLDER = os.path.abspath("templates")
    STATIC_FOLDER = os.path.abspath("static")
    ROOT_PATH = os.path.abspath(".")
    JINJA_EXTENSIONS = ['jinja2.ext.loopcontrols']
    
    DEBUG = False
    
    DATE_FORMAT = "%d.%m.%Y"
    
    LOGGING_FILE = "matboy.log"
    LOGGING_LEVEL = logging.WARNING
    
    LOCALE = 'ru_RU'
    
    
    @classmethod
    def setup(cls):
        """Setup builtin modules"""
        logging.basicConfig(handlers=[logging.FileHandler(filename=cls.LOGGING_FILE,
                                                          encoding='utf-8',)],
                            level=cls.LOGGING_LEVEL)
        logging.getLogger('serializer').setLevel(logging.WARNING)  # Disable spam log
        locale.setlocale(locale.LC_ALL, cls.LOCALE)



class DebugConfig(BaseConfig):
    DEBUG = True
    LOGGING_LEVEL = logging.DEBUG