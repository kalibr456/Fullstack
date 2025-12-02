from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from app.extensions import db, migrate, jwt

def create_app():
    app = Flask(__name__)

    # Конфигурация
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sportcenter.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = '12345'
    app.config['JWT_SECRET_KEY'] = '12345'

    # Настройки Swagger
    swagger_template = {
        "swagger": "2.0",
        "info": {"title": "Sport Center API", "version": "1.0"},
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Введите: Bearer <ваш_токен>"
            }
        },
        # "security": [{"Bearer": []}] 
    }

    # Инициализация
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app) # Разрешаем запросы с фронтенда
    Swagger(app, template=swagger_template)

    # --- ИМПОРТЫ БЛЮПРИНТОВ ---
    from app.routes.users import users_bp
    from app.routes.sections import sections_bp
    from app.routes.training import training_bp
    from app.routes.ai import ai_bp  # <--- 1. ПРОВЕРЬ ЭТОТ ИМПОРТ

    # --- РЕГИСТРАЦИЯ ---
    app.register_blueprint(users_bp)
    app.register_blueprint(sections_bp)
    app.register_blueprint(training_bp)  # <--- 2. САМОЕ ВАЖНОЕ: ЭТОЙ СТРОКИ НЕ ХВАТАЕТ!
    app.register_blueprint(ai_bp)

    # Создание таблиц
    with app.app_context():
        db.create_all()

    return app