from flask import Blueprint, jsonify, request

users_bp = Blueprint('users', __name__)

users = [
    {"username": "ivan", "email": "ivan@mail.com"},
    {"username": "anna", "email": "anna@mail.com"}
]

@users_bp.route('/users', methods=['GET'])
def get_users():
    """
    Получить список всех пользователей
    ---
    tags:
      - Пользователи
    responses:
      200:
        description: Список пользователей
    """
    return {"users": users}

@users_bp.route('/users/<username>', methods=['GET'])
def user_profile(username):
    """
    Получить профиль пользователя
    ---
    tags:
      - Пользователи
    parameters:
      - name: username
        in: path
        type: string
        required: true
    responses:
      200:
        description: Профиль пользователя
      404:
        description: Пользователь не найден
    """
    user = next((u for u in users if u["username"] == username), None)
    if user:
        return jsonify(user)
    return jsonify({"error": "Пользователь не найден"}), 404

@users_bp.route('/login', methods=['GET', 'POST'])
def login():
    """
    Вход пользователя
    ---
    tags:
      - Пользователи
    parameters:
      - name: body
        in: body
        required: false
        schema:
          properties:
            username:
              type: string
            password:
              type: string
    responses:
      200:
        description: Результат запроса
    """
    if request.method == 'POST':
        data = request.json
        return jsonify({"message": "Обработка POST-запроса", "data": data})
    else:
        return jsonify({"message": "Отображение формы входа (GET-запрос)"})
