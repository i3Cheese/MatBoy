import os
import logging
import locale


class BaseConfig:
    """
    Contains config constants.

    Call .setup() at the begging of the program.
    """

    DATA_BASE = 'db/matboy.db'
    DATA_BASE_URL = 'sqlite:///' + os.path.abspath('db/matboy.db') + '?check_same_thread=False'

    APP_CONFIG = {'SECRET_KEY': 'MatBoyIsVeryGoodBoy',
                  'MAIL_SERVER': 'smtp.gmail.com',
                  'MAIL_PORT': 465,
                  'MAIL_USE_SSL': True,
                  'MAIL_USE_TLS': False,
                  'MAIL_USERNAME': 'blogflask89@gmail.com',
                  'MAIL_DEFAULT_SENDER': 'blogflask89@gmail.com',
                  'MAIL_PASSWORD': 'av8-JJm-JFY-jiS'}

    APP_URL = "http://i3cheese.pythonanywhere.com/"

    TEMPLATES_FOLDER = os.path.abspath("templates")
    STATIC_FOLDER = os.path.abspath("static")
    ROOT_PATH = os.path.abspath(".")
    JINJA_EXTENSIONS = ['jinja2.ext.loopcontrols']

    DEBUG = False

    DATE_FORMAT = "%d.%m.%Y"

    LOGGING_FILE = "matboy.log"
    LOGGING_LEVEL = logging.WARNING

    LOCALE = 'ru'

    # Mail settings
    MAIL_DEFAULT_SENDER = 'blogflask89@gmail.com'

    @classmethod
    def setup(cls):
        """Setup builtin modules"""
        logging.basicConfig(handlers=[logging.FileHandler(filename=cls.LOGGING_FILE,
                                                          encoding='utf-8', )],
                            level=cls.LOGGING_LEVEL)
        logging.getLogger('serializer').setLevel(logging.WARNING)  # Disable spam log
        locale.setlocale(locale.LC_ALL, cls.LOCALE)


class DebugConfig(BaseConfig):
    DEBUG = True
    LOGGING_LEVEL = logging.DEBUG
    APP_URL = "http://127.0.0.1:5000/"
