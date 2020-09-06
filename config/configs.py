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
                    os.path.abspath('db/matboy.db') + '?check_same_thread=False'

    SECRET_KEY = None
    SECURITY_PASSWORD_SALT = None
    SECURITY_EMAIL_SALT = None

    CLIENT_ID = None
    VK_GROUP_ID = None
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

    LOGGING_FILE = "matboy.log"
    LOGGING_LEVEL = logging.WARNING

    LOCALE = 'ru_RU'

    @classmethod
    def setup(cls):
        """Setup builtin modules"""
        logging.basicConfig(handlers=[logging.FileHandler(filename=cls.LOGGING_FILE,
                                                          encoding='utf-8', )],
                            level=cls.LOGGING_LEVEL)
        logging.getLogger('serializer').setLevel(
            logging.WARNING)  # Disable spam log
        locale.setlocale(locale.LC_ALL, cls.LOCALE)


class DebugConfig(BaseConfig):
    DEBUG = True
    LOGGING_LEVEL = logging.DEBUG


class ProductionConfig(BaseConfig):
    DEBUG = False
    
class RegRu(ProductionConfig):
    SECRET_KEY = "taTFlcNv3ojMKjsg2TPo"
    
    CLIENT_ID = "7588530"
    VK_GROUP_ID = "198509476"
    ACCESS_TOKEN = "e73db2ec7a34dfbc140cc6cacebecfa0293855a767e16f623cd121df839b866bdcee413a7306f69450fec"
    
    
    # Recaptcha settings
    RECAPTCHA_PUBLIC_KEY = "6LebjsgZAAAAAD_nT-WR8P3L-XtdlZQIvOgpcoFA"
    RECAPTCHA_PRIVATE_KEY = "6LebjsgZAAAAAGdlfXaNLzd2wRCjo4M4LRNye5H8"
    
