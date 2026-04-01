from app import create_app
from app.extensions import db, jwt
from app.models import User, TokenBlocklist
from datetime import timedelta
from flask import jsonify

# ИМПОРТ НОВОГО БЛЮПРИНТА (Пункт 3)
# Убедитесь, что вы создали файл app/routes/external.py
from app.routes.external import external_bp

app = create_app()

# --- КОНФИГУРАЦИЯ (Лабораторная №4) ---
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

# Ключ для стороннего API (Пункт 5.3)
app.config["WEATHER_API_KEY"] = "d2ba7fa31d914df5412cc57dd71323c3"

# Регистрация роутов для SEO и Погоды
app.register_blueprint(external_bp, url_prefix='/external')

# --- SEO: КОРРЕКТНЫЕ HTTP СТАТУСЫ (Пункт 3.3) ---
@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"error": "Not Found", "status": 404}), 404

@app.errorhandler(403)
def forbidden(e):
    return jsonify({"error": "Forbidden", "status": 403}), 403

# --- ПРОВЕРКА ТОКЕНОВ (Лабораторная №2) ---
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token = TokenBlocklist.query.filter_by(jti=jti, revoked=True).first()
    return token is not None

# --- АВТО-СОЗДАНИЕ АДМИНА ---
with app.app_context():
    db.create_all()
    admin_exists = User.query.filter_by(role='admin').first()
    if not admin_exists:
        print("Создаю учетную запись администратора...")
        new_admin = User(
            username="admin", 
            email="admin@sportcenter.ru", 
            role="admin"
        )
        new_admin.set_password("admin123") 
        db.session.add(new_admin)
        db.session.commit()
        print("Админ успешно создан!")

if __name__ == "__main__":
    app.run(debug=True)