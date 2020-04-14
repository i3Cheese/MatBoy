from multiprocessing import Process
from config import config
import app
import api


def main():
    """Параллельно запускаем апи и приложение"""
    app_thread = Process(target=app.run)
    api_thread = Process(target=api.run)
    app_thread.start()
    api_thread.start()
    
if __name__ == "__main__":
    main()