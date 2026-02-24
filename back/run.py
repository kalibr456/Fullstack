from app import create_app
from app.extensions import db, jwt  # Добавили jwt
from app.models import User, TokenBlocklist # Добавили TokenBlocklist
from datetime import timedelta

app = create_app()

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    # Ищем токен в нашей новой таблице
    token = TokenBlocklist.query.filter_by(jti=jti, revoked=True).first()
    return token is not None

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
        print("Админ успешно создан! (admin / admin123)")
    else:
        print(f"Админ уже существует: {admin_exists.username}")

if __name__ == "__main__":
    app.run(debug=True)