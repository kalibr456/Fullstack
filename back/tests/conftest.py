import pytest
from app import create_app
from app.extensions import db
from app.models import User

@pytest.fixture
def app():
    # Создаем приложение с тестовым конфигом
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:", # База данных в памяти (очищается сама)
        "JWT_SECRET_KEY": "test-secret-key",
        "WTF_CSRF_ENABLED": False # Отключаем защиту форм для тестов
    })

    # Создаем таблицы в тестовой БД
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    # Этот объект имитирует браузер/Postman для отправки запросов
    return app.test_client()

@pytest.fixture
def admin_token(client, app):
    # Вспомогательная фикстура для получения токена админа
    with app.app_context():
        admin = User(username="testadmin", email="test@admin.com", role="admin")
        admin.set_password("password")
        db.session.add(admin)
        db.session.commit()
        
        res = client.post('/users/login', json={
            "username": "testadmin",
            "password": "password"
        })
        return res.json['access_token']