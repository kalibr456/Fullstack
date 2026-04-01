import pytest

# 1. Тест регистрации (Пункт 2.2 и 2.3 задания)
def test_register_user(client):
    response = client.post('/users/register', json={
        "username": "newuser",
        "email": "new@user.com",
        "password": "password123"
    })
    assert response.status_code == 201
    assert response.json['message'] == "Регистрация успешна"

# 2. Тест авторизации и получения токенов (Пункт 4.1 лабы №2 и Пункт 2.2 лабы №5)
def test_login_success(client):
    # Сначала регистрируем
    client.post('/users/register', json={
        "username": "loginuser",
        "email": "login@user.com",
        "password": "password123"
    })
    # Пытаемся войти
    response = client.post('/users/login', json={
        "username": "loginuser",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json
    assert "refresh_token" in response.json

# 3. Тест защиты прав (RBAC): юзер не может менять роли (Пункт 3.3 задания)
def test_user_cannot_change_roles(client):
    # Регистрируем и логинимся как обычный юзер
    client.post('/users/register', json={
        "username": "simpleuser",
        "email": "simple@user.com",
        "password": "password"
    })
    login_res = client.post('/users/login', json={
        "username": "simpleuser",
        "password": "password"
    })
    token = login_res.json['access_token']

    # Пытаемся зайти в список пользователей (только для админа)
    response = client.get('/users/', headers={"Authorization": f"Bearer {token}"})
    
    # Ожидаем 403 Forbidden
    assert response.status_code == 403