from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # 🔹 Настройка базы данных
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sportcenter.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 🔹 Секретный ключ для JWT
    app.config['SECRET_KEY'] = '12345'
    
    # 🔹 Swagger с поддержкой BearerAuth
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "Sport Center API",
            "version": "1.0",
            "description": "API спортцентра с JWT"
        },
        "securityDefinitions": {
            "BearerAuth": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT токен в формате 'Bearer <токен>'"
            }
        }
    }
    
    Swagger(app, template=swagger_template)
    CORS(app)
    
    db.init_app(app)
    
    from app.routes.sections import sections_bp
    from app.routes.training import training_bp
    from app.routes.ai import ai_bp
    from app.routes.users import users_bp

    app.register_blueprint(sections_bp)
    app.register_blueprint(training_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(users_bp)

    with app.app_context():
        db.create_all()

    return app



