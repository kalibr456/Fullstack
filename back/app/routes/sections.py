from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Section, User

sections_bp = Blueprint('sections', __name__, url_prefix='/sections')

# =====================================
# GET: получить все секции (Публичный доступ)
# =====================================
@sections_bp.route('/', methods=['GET'])
def get_sections():
    """
    Получить список всех доступных секций
    ---
    tags:
      - Sections
    responses:
      200:
        description: Список секций успешно получен
        schema:
          properties:
            sections:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  name:
                    type: string
                  description:
                    type: string
    """
    # Можно добавить public access, токен не обязателен для просмотра расписания
    sections = Section.query.all()
    # Используем метод to_dict() из модели
    return jsonify({
        "sections": [s.to_dict() for s in sections]
    })


# =====================================
# POST: добавить новую секцию
# =====================================
@sections_bp.route('/', methods=['POST'])
@jwt_required()
def add_section():
    """
    Создать новую секцию
    ---
    tags:
      - Sections
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
          properties:
            name:
              type: string
              example: "Бокс"
            description:
              type: string
              example: "Тренировки по боксу для начинающих"
    responses:
      201:
        description: Секция успешно создана
      400:
        description: Ошибка валидации или такая секция уже есть
    """
    # Важное примечание: В реальном приложении здесь стоит проверить, 
    # является ли пользователь администратором (user.is_admin == True).
    # Пока доступ разрешен любому авторизованному пользователю.
    
    data = request.json
    if not data or "name" not in data:
        return jsonify({"error": "Не указано имя секции"}), 400

    if Section.query.filter_by(name=data["name"]).first():
        return jsonify({"error": "Секция с таким именем уже существует"}), 400

    new_section = Section(
        name=data["name"],
        description=data.get("description")
    )
    
    db.session.add(new_section)
    db.session.commit()
    
    return jsonify(new_section.to_dict()), 201


# =====================================
# PUT: обновить секцию
# =====================================
@sections_bp.route('/<int:section_id>', methods=['PUT'])
@jwt_required()
def update_section(section_id):
    """
    Обновить данные секции
    ---
    tags:
      - Sections
    security:
      - Bearer: []
    parameters:
      - in: path
        name: section_id
        type: integer
        required: true
        description: ID секции
      - in: body
        name: body
        schema:
          type: object
          properties:
            name:
              type: string
            description:
              type: string
    responses:
      200:
        description: Секция обновлена
      404:
        description: Секция не найдена
    """
    section = db.session.get(Section, section_id)
    
    if not section:
        return jsonify({"error": "Секция не найдена"}), 404

    data = request.json
    if "name" in data:
        section.name = data["name"]
    if "description" in data:
        section.description = data["description"]
        
    db.session.commit()
    
    return jsonify(section.to_dict())


# =====================================
# DELETE: удалить секцию
# =====================================
@sections_bp.route('/<int:section_id>', methods=['DELETE'])
@jwt_required()
def delete_section(section_id):
    """
    Удалить секцию
    ---
    tags:
      - Sections
    security:
      - Bearer: []
    parameters:
      - in: path
        name: section_id
        type: integer
        required: true
        description: ID секции
    responses:
      200:
        description: Секция удалена
      404:
        description: Секция не найдена
    """
    section = db.session.get(Section, section_id)
    
    if not section:
        return jsonify({"error": "Секция не найдена"}), 404

    section_name = section.name
    db.session.delete(section)
    db.session.commit()
    
    return jsonify({"message": f"Секция '{section_name}' удалена"})


# =====================================
# POST: Записаться в секцию (Join)
# =====================================
@sections_bp.route('/join', methods=['POST'])
@jwt_required()
def join_section():
    """
    Записаться в секцию (User <-> Section)
    ---
    tags:
      - Sections
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - section_id
          properties:
            section_id:
              type: integer
              example: 1
    responses:
      200:
        description: Успешная запись
      400:
        description: Уже записан или неверные данные
      404:
        description: Секция не найдена
    """
    # 1. Получаем ID пользователя из токена
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    data = request.json
    if not data or "section_id" not in data:
        return jsonify({"error": "Не указан ID секции"}), 400

    # 2. Ищем секцию
    section = db.session.get(Section, data["section_id"])
    if not section:
        return jsonify({"error": "Секция не найдена"}), 404

    # 3. Проверяем связь Many-to-Many
    if section in user.sections:
        return jsonify({"error": "Вы уже записаны в эту секцию"}), 400

    # 4. Добавляем связь
    user.sections.append(section)
    db.session.commit()

    return jsonify({
        "message": f"Вы успешно записались в секцию '{section.name}'",
        "my_sections": [s.name for s in user.sections]
    })


# =====================================
# POST: Отписаться от секции (Leave)
# =====================================
@sections_bp.route('/leave', methods=['POST'])
@jwt_required()
def leave_section():
    """
    Покинуть секцию
    ---
    tags:
      - Sections
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - section_id
          properties:
            section_id:
              type: integer
              example: 1
    responses:
      200:
        description: Успешно покинули секцию
      400:
        description: Вы не состоите в этой секции
      404:
        description: Секция не найдена
    """
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    data = request.json
    if not data or "section_id" not in data:
        return jsonify({"error": "Не указан ID секции"}), 400

    section = db.session.get(Section, data["section_id"])
    if not section:
        return jsonify({"error": "Секция не найдена"}), 404

    if section not in user.sections:
        return jsonify({"error": "Вы не состоите в этой секции"}), 400

    user.sections.remove(section)
    db.session.commit()

    return jsonify({
        "message": f"Вы покинули секцию '{section.name}'"
    })