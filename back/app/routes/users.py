from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    jwt_required, get_jwt_identity, get_jwt,
    create_access_token, create_refresh_token
)
from datetime import timedelta, datetime
from app.extensions import db
from app.models import User, TokenBlocklist
from app.utils import admin_required

# ==========================================================
# СЛОИ АРХИТЕКТУРЫ (Repository & Service)
# ==========================================================

class UserRepository:
    def get_by_id(self, user_id):
        return db.session.get(User, int(user_id))

    def get_by_username(self, username):
        return User.query.filter_by(username=username).first()

    def get_all(self):
        return User.query.all()

    def save(self, obj):
        db.session.add(obj)
        db.session.commit()

class AuthService:
    def __init__(self, repo):
        self.repo = repo

    def register(self, username, email, password):
        if self.repo.get_by_username(username):
            return None
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        self.repo.save(new_user)
        return new_user

    def authenticate(self, username, password):
        user = self.repo.get_by_username(username)
        if not user or not user.check_password(password):
            return None
        
        # Генерация пары токенов (Access и Refresh)
        access = create_access_token(identity=str(user.id), expires_delta=timedelta(minutes=15))
        refresh = create_refresh_token(identity=str(user.id), expires_delta=timedelta(days=30))
        
        return {
            "access_token": access,
            "refresh_token": refresh,
            "role": user.role,
            "user": user.to_dict()
        }

    def revoke_token(self, jti, token_type, user_id):
        expires = datetime.utcnow() + (timedelta(minutes=15) if token_type == 'access' else timedelta(days=30))
        blocked = TokenBlocklist(jti=jti, token_type=token_type, user_id=int(user_id), expires=expires, revoked=True)
        db.session.add(blocked)
        db.session.commit()

# Инициализация
user_repo = UserRepository()
auth_service = AuthService(user_repo)

users_bp = Blueprint('users', __name__, url_prefix='/users')

# ==========================================================
# ЭНДПОИНТЫ (API Layer)
# ==========================================================

@users_bp.route('/register', methods=['POST'])
def register_user():
    """
    Регистрация пользователя
    ---
    tags: [Users]
    parameters:
      - in: body
        name: body
        schema:
          properties:
            username: {type: string}
            email: {type: string}
            password: {type: string}
    responses:
      201: {description: Успех}
      400: {description: Ошибка}
    """
    data = request.json
    user = auth_service.register(data.get("username"), data.get("email"), data.get("password"))
    if not user:
        return jsonify({"error": "Пользователь уже существует"}), 400
    return jsonify({"message": "Регистрация успешна"}), 201

@users_bp.route('/login', methods=['POST'])
def login():
    """
    Вход (Получение Access и Refresh токенов)
    ---
    tags: [Users]
    parameters:
      - in: body
        name: body
        schema:
          properties:
            username: {type: string}
            password: {type: string}
    responses:
      200: {description: Токены получены}
      401: {description: Ошибка авторизации}
    """
    data = request.json
    result = auth_service.authenticate(data.get("username"), data.get("password"))
    if not result:
        return jsonify({"error": "Неверный логин или пароль"}), 401
    return jsonify(result)

@users_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Обновление Access токена
    ---
    tags: [Users]
    security: [{Bearer: []}]
    """
    identity = get_jwt_identity()
    new_access = create_access_token(identity=identity, expires_delta=timedelta(minutes=15))
    return jsonify({"access_token": new_access})

@users_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Выход (Отзыв токена)
    ---
    tags: [Users]
    security: [{Bearer: []}]
    """
    jti = get_jwt()["jti"]
    user_id = get_jwt_identity()
    auth_service.revoke_token(jti, 'access', user_id)
    return jsonify({"message": "Выход выполнен успешно"}), 200

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def user_profile():
    """
    Личный профиль
    ---
    tags: [Users]
    security: [{Bearer: []}]
    """
    user_id = get_jwt_identity()
    user = user_repo.get_by_id(user_id)
    return jsonify(user.to_dict(include_email=True))

@users_bp.route('/', methods=['GET'])
@jwt_required()
@admin_required()
def get_all_users():
    """
    Список всех (Только Админ)
    ---
    tags: [Users]
    security: [{Bearer: []}]
    """
    users = user_repo.get_all()
    return jsonify({"users": [u.to_dict() for u in users]})

@users_bp.route('/<int:user_id>/role', methods=['PUT'])
@jwt_required()
@admin_required()
def change_user_role(user_id):
    """
    Смена роли (Только Админ)
    ---
    tags: [Users]
    security: [{Bearer: []}]
    """
    data = request.json
    new_role = data.get("role")
    user = user_repo.get_by_id(user_id)
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404
    user.role = new_role
    db.session.commit()
    return jsonify({"message": "Роль изменена", "user": user.to_dict()})