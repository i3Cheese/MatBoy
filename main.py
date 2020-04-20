from multiprocessing import Process
from config import config
import app


def main():
    config.setup()
    app.run()


if __name__ == "__main__":
    main()
