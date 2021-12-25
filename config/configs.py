import os
import logging
import locale


class BaseConfig:
    """
    Contains config constants.

    Call .setup() at the begging of the program.
    """

    DATA_BASE = 'db/matboy.db'
    DATA_BASE_URL = 'sqlite:///' + \
                    os.path.abspath(
                        'db/matboy.db') + '?check_same_thread=False'

    SECRET_KEY = None
    SECURITY_PASSWORD_SALT = None
    SECURITY_EMAIL_SALT = None

    CLIENT_ID = None
    VK_GROUP_ID = None
    VK_SECRET_KEY = None
    ACCESS_TOKEN = None

    # Recaptcha settings
    RECAPTCHA_PUBLIC_KEY = None
    RECAPTCHA_PRIVATE_KEY = None

    # Mail settings
    FEEDBACK_MAIL = None
    MAIL_DEFAULT_SENDER = None
    MAIL_PASSWORD = None
    MAIL_PORT = None
    MAIL_SERVER = None
    MAIL_USERNAME = None
    MAIL_USE_SSL = True
    MAIL_USE_TLS = False

    TEMPLATES_FOLDER = os.path.abspath("templates")
    STATIC_FOLDER = os.path.abspath("static")
    ROOT_PATH = os.path.abspath(".")
    JINJA_EXTENSIONS = ['jinja2.ext.loopcontrols']

    DEBUG = False

    DATE_FORMAT = "%d.%m.%Y"

    LOGGING_FILE = os.path.abspath("matboy.log")
    LOGGING_LEVEL = logging.WARNING

    LOCALE_LIST = ['ru_RU.utf8', 'ru_RU', 'ru']
    LOCALE = None

    @classmethod
    def setup(cls):
        """Setup builtin modules"""
        fh = logging.FileHandler(filename=cls.LOGGING_FILE, encoding='utf-8')
        logging.basicConfig(handlers=[fh],
                            level=cls.LOGGING_LEVEL,
                            force=True)
        logging.error(cls.LOGGING_FILE)
        logging.getLogger('serializer').setLevel(
            logging.WARNING)  # Disable spam log
        for locale_name in cls.LOCALE_LIST:
            try:
                locale.setlocale(locale.LC_ALL, locale_name)
            except locale.Error:
                pass
            else:
                cls.LOCALE = locale
                break
        if cls.LOCALE is None:
            raise locale.Error("OS does not support any of locales")


class DebugConfig(BaseConfig):
    DEBUG = True
    LOGGING_LEVEL = logging.DEBUG
    SECRET_KEY = '11'


class ProductionConfig(BaseConfig):
    DEBUG = False
    LOGGING_LEVEL = logging.INFO
    SECRET_KEY = 'dByFs7fb'
    DATA_BASE = 'postgresql://postgres:interned2003@localhost:5432/MatBoy2'
    DATA_BASE_URL = 'postgresql://postgres:interned2003@localhost:5432/MatBoy2'
