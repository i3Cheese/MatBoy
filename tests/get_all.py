from config import config
import requests
from pprint import pprint

address = f"http://{config.HOST}:{config.API_PORT}/"
res = requests.get(address+"user/1")
pprint(res.json())
res = requests.get(address+"users")
pprint(res.json())
        