from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User

users_bp = Blueprint('users', __name__, url_prefix='/users')

# ===============================
# REGISTRATION
# ===============================
@users_bp.route('/register', methods=['POST'])
def register_user():
    """
    Регистрация нового пользователя
    ---
    tags:
      - Users
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - email
            - password
          properties:
            username:
              type: string
              example: "ivan_sport"
            email:
              type: string
              example: "ivan@example.com"
            password:
              type: string
              example: "secret123"
    responses:
      201:
        description: Пользователь успешно зарегистрирован
      400:
        description: Ошибка валидации или пользователь уже существует
    """
    data = request.json
    
    # Проверка входных данных
    if not data or not all(k in data for k in ("username", "email", "password")):
        return jsonify({"error": "Некорректные данные"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Пользователь уже существует"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email уже занят"}), 400

    # Создание пользователя
    new_user = User(username=data["username"], email=data["email"])
    new_user.set_password(data["password"])

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "Пользователь зарегистрирован",
        "user": new_user.to_dict()
    }), 201


# ===============================
# LOGIN
# ===============================
@users_bp.route('/login', methods=['POST'])
def login():
    """
    Вход в систему (получение JWT токена)
    ---
    tags:
      - Users
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              example: "ivan_sport"
            password:
              type: string
              example: "secret123"
    responses:
      200:
        description: Токен получен успешно
        schema:
          properties:
            message:
              type: string
            token:
              type: string
      401:
        description: Неверный логин или пароль
    """
    data = request.json
    user = User.query.filter_by(username=data.get("username")).first()

    # Проверка пароля
    if not user or not user.check_password(data.get("password", "")): 
        return jsonify({"error": "Неверный логин или пароль"}), 401

    # Генерируем токен (identity - это ID пользователя в строковом формате)
    access_token = create_access_token(identity=str(user.id))

    return jsonify({"message": "Вход успешен", "token": access_token})


# ===============================
# GET USER PROFILE
# ===============================
@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def user_profile():
    """
    Получить данные своего профиля
    ---
    tags:
      - Users
    security:
      - Bearer: []
    responses:
      200:
        description: Данные профиля
        schema:
          properties:
            id:
              type: integer
            username:
              type: string
            email:
              type: string
            created_at:
              type: string
            sections:
              type: array
              items:
                type: object
      404:
        description: Пользователь не найден
    """
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    return jsonify(user.to_dict(include_email=True))


# ===============================
# UPDATE USER
# ===============================
@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_user():
    """
    Обновить данные профиля (Email или Пароль)
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            email:
              type: string
              example: "new_email@example.com"
            password:
              type: string
              example: "new_secret_password"
    responses:
      200:
        description: Данные обновлены
      404:
        description: Пользователь не найден
    """
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    data = request.json
    if "email" in data:
        user.email = data["email"]
    
    if "password" in data:
        user.set_password(data["password"])

    db.session.commit()

    return jsonify(user.to_dict(include_email=True))


# ===============================
# DELETE USER
# ===============================
@users_bp.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_user():
    """
    Удалить свой аккаунт
    ---
    tags:
      - Users
    security:
      - Bearer: []
    responses:
      200:
        description: Аккаунт удален
      404:
        description: Пользователь не найден
    """
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Ваш аккаунт удалён"})

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_users():
    """
    Получить список всех участников
    ---
    tags:
      - Users
    security:
      - Bearer: []
    responses:
      200:
        description: Список пользователей
        schema:
          properties:
            users:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  username:
                    type: string
                  sections:
                    type: array
    """
    # Запрашиваем всех пользователей из БД
    users = User.query.all()
    
    # Возвращаем список словарей
    return jsonify({
        "users": [u.to_dict() for u in users]
    })