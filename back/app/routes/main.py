from flask import request
from app import app
from flasgger.utils import swag_from

@app.route('/')
def home():
    """Главная страница API"""
    return {"message": "API Спортцентра работает!"}

@app.route('/user/<username>')
@swag_from({
    'tags': ['Пользователи'],
    'parameters': [
        {
            'name': 'username',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Имя пользователя'
        }
    ],
    'responses': {
        200: {
            'description': 'Профиль пользователя',
            'examples': {
                'application/json': {'username': 'Иван', 'status': 'Активен'}
            }
        }
    }
})
def user_profile(username):
    return {'username': username, 'status': 'Активен'}
