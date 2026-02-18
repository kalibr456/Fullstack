# app/utils.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models import User
from app.extensions import db

def admin_required():
    """
    Декоратор для защиты эндпоинтов, доступных только админу.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user_id = get_jwt_identity()
            user = db.session.get(User, int(user_id))
            
            if not user:
                return jsonify({"error": "Пользователь не найден"}), 404
                
            if user.role != 'admin':
                return jsonify({"error": "Доступ запрещен. Требуются права администратора"}), 403
                
            return fn(*args, **kwargs)
        return decorator
    return wrapper