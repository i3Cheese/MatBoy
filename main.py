from multiprocessing import Process
from config import config
import logging
import app


logging.basicConfig(handlers=[logging.FileHandler(filename=config.LOGGING_FILE,
                                                  encoding='utf-8',)],
                    level=config.LOGGING_LEVEL)
logging.getLogger('serializer').setLevel(logging.WARNING)  # Disable spam log


def main():
    app.run()


if __name__ == "__main__":
    main()
