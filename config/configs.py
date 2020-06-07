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

    SECRET_KEY = 'GsxXaaCMycS9HVRPlR7h'
    SECURITY_PASSWORD_SALT = 'ADFGpkem4332qreFfdsg424123FSGfmf'
    SECURITY_EMAIL_SALT = 'AJGgsfn4325gNSFHOn4tgrjon4neojSAED234'

    CLIENT_ID = '7491040'
    VK_GROUP_ID = '193140435'
    ACCESS_TOKEN = 'd1890a9fb243a245bc230a12dbf7e0b158cabee544a3ed362b16d0520b1ff4192a07fd189e4347fa20786'

    # Recaptcha settings
    RECAPTCHA_PRIVATE_KEY = '6LdXLAEVAAAAAG2uPNCF-dxCpHnW7r9VLr0xoibB'
    RECAPTCHA_PUBLIC_KEY = '6LdXLAEVAAAAAJ8P5IgVnWdz-3jXAGzCf7-3ikqY'

    # Mail settings
    FEEDBACK_MAIL = 'ebedak2003@yandex.ru'
    MAIL_DEFAULT_SENDER = 'blogflask89@gmail.com'
    MAIL_PASSWORD = 'av8-JJm-JFY-jiS'
    MAIL_PORT = 465
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_USERNAME = 'blogflask89@gmail.com'
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

