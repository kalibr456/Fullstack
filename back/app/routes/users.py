from flask import Blueprint, jsonify, request, current_app
from app import db
from app.models import User
from functools import wraps
import jwt
import datetime
from flasgger import swag_from
from werkzeug.security import generate_password_hash, check_password_hash

users_bp = Blueprint('users', __name__, url_prefix='/users')

# 🔹 JWT decorator с передачей current_user
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(username=data["username"]).first()
            if not current_user:
                raise Exception("User not found")
        except Exception as e:
            return jsonify({"error": "Token is invalid!", "details": str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# 🔹 POST: регистрация
@users_bp.route('/register', methods=['POST'])
@swag_from({
    "tags": ["Пользователи"],
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "username": {"type": "string", "example": "ivan"},
                    "email": {"type": "string", "example": "ivan@mail.com"},
                    "password": {"type": "string", "example": "12345"}
                }
            }
        }
    ],
    "responses": {
        "201": {"description": "Пользователь зарегистрирован"},
        "400": {"description": "Пользователь уже существует или некорректные данные"}
    }
})
def register_user():
    data = request.json
    if not data or not all(k in data for k in ("username", "email", "password")):
        return jsonify({"error": "Некорректные данные"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Пользователь уже существует"}), 400

    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    new_user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Пользователь зарегистрирован!", 
                    "user": {"username": new_user.username, "email": new_user.email}}), 201

# 🔹 POST: логин
@users_bp.route('/login', methods=['POST'])
@swag_from({
    "tags": ["Пользователи"],
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "username": {"type": "string", "example": "ivan"},
                    "password": {"type": "string", "example": "12345"}
                }
            }
        }
    ],
    "responses": {
        "200": {"description": "Вход успешен, возвращается JWT"},
        "401": {"description": "Неверный логин или пароль"}
    }
})
def login():
    data = request.json
    if not data or not all(k in data for k in ("username", "password")):
        return jsonify({"error": "Некорректные данные"}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"error": "Неверный логин или пароль"}), 401

    token = jwt.encode(
        {"username": user.username, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
        current_app.config['SECRET_KEY'], algorithm="HS256"
    )
    return jsonify({"message": "Вход успешен", "token": token})

# 🔹 GET: все пользователи
@users_bp.route('/', methods=['GET'])
@token_required
def get_users(current_user):
    users = User.query.all()
    return jsonify({"users": [{"username": u.username, "email": u.email} for u in users]})

# 🔹 GET: профиль пользователя
@users_bp.route('/<username>', methods=['GET'])
@token_required
def user_profile(current_user, username):
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"username": user.username, "email": user.email})
    return jsonify({"error": "Пользователь не найден"}), 404

# 🔹 PUT: обновление пользователя
@users_bp.route('/<username>', methods=['PUT'])
@token_required
def update_user(current_user, username):
    data = request.json
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404
    if "email" in data:
        user.email = data["email"]
    db.session.commit()
    return jsonify({"username": user.username, "email": user.email})

# 🔹 DELETE: удалить пользователя
@users_bp.route('/<username>', methods=['DELETE'])
@token_required
def delete_user(current_user, username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"Пользователь {username} удалён"})
