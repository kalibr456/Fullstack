from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
# Импортируем объекты из extensions
from app.extensions import db, migrate, jwt

def create_app():
    app = Flask(__name__)

    # Конфигурация
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sportcenter.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = '12345'
    app.config['JWT_SECRET_KEY'] = '12345'

    # Настройка Swagger
    swagger_template = {
        "swagger": "2.0",
        "info": {"title": "Sport Center API", "version": "1.0"},
        "securityDefinitions": {
            # ИМЯ ДОЛЖНО БЫТЬ "Bearer", чтобы совпадать с вашими блюпринтами
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Введите: Bearer <ваш_токен>"
            }
        },
        # Это применит защиту ко всем ручкам глобально, 
        # но лучше полагаться на настройки внутри блюпринтов.
        # "security": [{"Bearer": []}] 
    }

    # Инициализация расширений
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    Swagger(app, template=swagger_template)

    # Регистрация Blueprints
    from app.routes.users import users_bp
    from app.routes.sections import sections_bp
    from app.routes.training import training_bp
    from app.routes.ai import ai_bp
    # from app.routes.ai import ai_bp # Раскомментируйте, если файл существует

    app.register_blueprint(users_bp)
    app.register_blueprint(sections_bp)
    app.register_blueprint(training_bp)
    app.register_blueprint(ai_bp)
    # app.register_blueprint(ai_bp)

    # Автоматическое создание таблиц
    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)