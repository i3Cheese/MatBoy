from multiprocessing import Process
from config import config
import app
import api


def main():
    app.run()
    # app_thread = Process(target=)
    # api_thread = Process(target=api.run)
    # app_thread.start()
    # api_thread.start()
    # app_thread.join()
    # api_thread.join()
    
if __name__ == "__main__":
    main()