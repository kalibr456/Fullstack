from flask import Flask, request, jsonify
from flasgger import Swagger, swag_from

app = Flask(__name__)
swagger = Swagger(app)

@app.route('/')
def home():
    """
    Главная страница API
    ---
    tags:
      - Главная
    responses:
      200:
        description: Сообщение о работе API
        examples:
          application/json: {"message": "API Спортцентра работает!"}
    """
    return jsonify({"message": "API Спортцентра работает!"})


@app.route('/user/<string:username>', methods=['GET'])
@swag_from({
    'tags': ['Пользователи'],
    'parameters': [
        {
            'name': 'username',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Имя пользователя, для которого запрашивается профиль'
        }
    ],
    'responses': {
        200: {
            'description': 'Профиль пользователя успешно получен',
            'examples': {
                'application/json': {
                    'username': 'ivan',
                    'status': 'Активен',
                    'email': 'ivan@mail.com'
                }
            }
        },
        404: {
            'description': 'Пользователь не найден',
            'examples': {
                'application/json': {'error': 'Пользователь не найден'}
            }
        }
    }
})
def user_profile(username):
    # Пример: имитация поиска пользователя
    users = [
        {"username": "ivan", "status": "Активен", "email": "ivan@mail.com"},
        {"username": "anna", "status": "Активен", "email": "anna@mail.com"}
    ]
    user = next((u for u in users if u["username"] == username), None)
    if user:
        return jsonify(user)
    return jsonify({"error": "Пользователь не найден"}), 404
