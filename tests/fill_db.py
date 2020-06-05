from config import config
import requests
from pprint import pprint

address = f"http://{config.HOST}:{config.API_PORT}/"
for i in range(10):
    res = requests.post(address + "users", json={"surname": f"Иванов",
                                                 "name": f"Робот{i}",
                                                 "city": "Москва",
                                                 "birthday": "12.12.2012",
                                                 "password": f"31415926_{i}",
                                                 "email": f"robot{i}@factory.com"
                                                 })
    pprint(res.json())
