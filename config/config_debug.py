DATA_BASE = "sqlite:///../db/matboy.db?check_same_thread=False"
app_config = {'SQLALCHEMY_DATABASE_URI': DATA_BASE,
       'SECRET_KEY': 'MatBoyIsVeryGoodBoy',
       "SQLALCHEMY_TRACK_MODIFICATIONS": False,
       }
DEBUG = True