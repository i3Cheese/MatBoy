from multiprocessing import Process
from config import config
import app


def main():
    """Параллельно запускаем апи и приложение"""
    app.run()
    
if __name__ == "__main__":
    main()