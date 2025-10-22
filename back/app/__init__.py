from flask import Flask
from flasgger import Swagger
from flask_cors import CORS  # импорт CORS

def create_app():
    app = Flask(__name__)
    
    # Подключаем Swagger
    Swagger(app)
    
    # Подключаем CORS (разрешаем запросы с любого фронтенда)
    CORS(app)

    # Импорт и регистрация Blueprint
    from app.routes.sections import sections_bp
    from app.routes.training import training_bp
    from app.routes.ai import ai_bp
    from app.routes.users import users_bp

    app.register_blueprint(sections_bp)
    app.register_blueprint(training_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(users_bp)

    return app


