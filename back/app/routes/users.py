from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User
# Импортируем декоратор для проверки прав (убедитесь, что файл app/utils.py создан)
from app.utils import admin_required 

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

    # Создание пользователя (по умолчанию роль 'user' задана в модели)
    new_user = User(username=data["username"], email=data["email"])
    new_user.set_password(data["password"])

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "Пользователь зарегистрирован",
        "user": new_user.to_dict()
    }), 201


# ===============================
# LOGIN (Возвращает роль!)
# ===============================
@users_bp.route('/login', methods=['POST'])
def login():
    """
    Вход в систему (получение JWT токена и Роли)
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
            role:
              type: string
              description: Роль пользователя (user или admin)
      401:
        description: Неверный логин или пароль
    """
    data = request.json
    user = User.query.filter_by(username=data.get("username")).first()

    # Проверка пароля
    if not user or not user.check_password(data.get("password", "")): 
        return jsonify({"error": "Неверный логин или пароль"}), 401

    # Генерируем токен
    access_token = create_access_token(identity=str(user.id))

    # (!) ВАЖНО: Возвращаем роль вместе с токеном
    return jsonify({
        "message": "Вход успешен", 
        "token": access_token,
        "role": user.role 
    })


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
            role:
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
            password:
              type: string
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


# ===============================
# GET ALL USERS (Только Админ)
# ===============================
@users_bp.route('/', methods=['GET'])
@jwt_required()
@admin_required()  # <--- ЗАЩИТА: Только админ
def get_all_users():
    """
    Получить список всех участников (Только для Админа)
    ---
    tags:
      - Users
    security:
      - Bearer: []
    responses:
      200:
        description: Список пользователей
      403:
        description: Требуются права администратора
    """
    # Запрашиваем всех пользователей из БД
    users = User.query.all()
    
    # Возвращаем список словарей
    return jsonify({
        "users": [u.to_dict() for u in users]
    })


# ===============================
# CHANGE ROLE (Только Админ)
# ===============================
@users_bp.route('/<int:user_id>/role', methods=['PUT'])
@jwt_required()
@admin_required()  # <--- ЗАЩИТА: Только админ
def change_user_role(user_id):
    """
    Изменить роль пользователя (Только для Админа)
    ---
    tags:
      - Users
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        description: ID пользователя
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - role
          properties:
            role:
              type: string
              enum: [user, admin]
              description: Новая роль
    responses:
      200:
        description: Роль успешно изменена
      400:
        description: Недопустимая роль
      403:
        description: Требуются права администратора
      404:
        description: Пользователь не найден
    """
    data = request.json
    new_role = data.get("role")
    
    # Валидация
    if new_role not in ['user', 'admin']:
        return jsonify({"error": "Недопустимая роль. Используйте 'user' или 'admin'"}), 400
        
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404
        
    user.role = new_role
    db.session.commit()
    
    return jsonify({
        "message": f"Роль пользователя {user.username} изменена на {new_role}",
        "user": user.to_dict()
    })