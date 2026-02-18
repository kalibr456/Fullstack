from app import create_app
from app.extensions import db  # Импортируем базу данных
from app.models import User    # Импортируем модель пользователя

app = create_app()

# --- БЛОК АВТОМАТИЧЕСКОГО СОЗДАНИЯ АДМИНА ---
with app.app_context():
    # 1. Создаем таблицы, если их еще нет
    db.create_all()
    
    # 2. Ищем пользователя с ролью admin
    admin_exists = User.query.filter_by(role='admin').first()
    
    if not admin_exists:
        print("Создаю учетную запись администратора...")
        new_admin = User(
            username="admin", 
            email="admin@sportcenter.ru", 
            role="admin"
        )
        # Указываем пароль. Он автоматически зашифруется методом set_password
        new_admin.set_password("admin123") 
        
        db.session.add(new_admin)
        db.session.commit()
        print("Админ успешно создан!")
        print("Логин: admin")
        print("Пароль: admin123")
    else:
        print(f"Админ уже существует: {admin_exists.username}")
# --------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)