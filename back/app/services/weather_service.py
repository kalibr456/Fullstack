import requests
from flask import current_app

class WeatherService:
    def __init__(self):
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"

    def get_weather(self, city="Moscow"):
        api_key = current_app.config.get("WEATHER_API_KEY")
        
        # Специальный пустой словарь прокси, чтобы игнорировать системные настройки
        no_proxies = {
            "http": None,
            "https": None,
        }
        
        try:
            params = {
                "q": city,
                "appid": api_key,
                "units": "metric",
                "lang": "ru"
            }
            # Добавляем proxies=no_proxies в запрос
            response = requests.get(
                self.base_url, 
                params=params, 
                timeout=5, 
                proxies=no_proxies # <-- Игнорируем прокси
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "temp": round(data["main"]["temp"]),
                    "desc": data["weather"][0]["description"].capitalize(),
                    "icon": data["weather"][0]["icon"],
                    "city": data["name"]
                }
            print(f"Weather API error code: {response.status_code}")
            return None
        except Exception as e:
            # Тот самый текст ошибки, который ты скинул, попадет сюда
            print(f"Weather Connection error: {e}")
            return None