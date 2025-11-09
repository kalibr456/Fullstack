from flask import Blueprint, jsonify, request
from app import db
from app.models import Section, User

sections_bp = Blueprint('sections', __name__, url_prefix='/sections')


# GET: получить все секции
@sections_bp.route('/', methods=['GET'])
def get_sections():
    """
    Получить список всех секций
    ---
    tags:
      - Секции
    responses:
      200:
        description: Список секций
        schema:
          type: object
          properties:
            sections:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                    example: 1
                  name:
                    type: string
                    example: "Футбол"
    """
    sections = Section.query.all()
    return jsonify({
        "sections": [{"id": s.id, "name": s.name} for s in sections]
    })


# POST: добавить новую секцию
@sections_bp.route('/', methods=['POST'])
def add_section():
    """
    Добавить новую секцию
    ---
    tags:
      - Секции
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Йога"
    responses:
      201:
        description: Секция добавлена
        schema:
          type: object
          properties:
            id:
              type: integer
              example: 4
            name:
              type: string
              example: "Йога"
      400:
        description: Ошибка при добавлении секции
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Секция с таким именем уже существует"
    """
    data = request.json
    if not data or "name" not in data:
        return jsonify({"error": "Не указано имя секции"}), 400

    if Section.query.filter_by(name=data["name"]).first():
        return jsonify({"error": "Секция с таким именем уже существует"}), 400

    section = Section(name=data["name"])
    db.session.add(section)
    db.session.commit()
    return jsonify({"id": section.id, "name": section.name}), 201


# PUT: обновить секцию
@sections_bp.route('/<int:section_id>', methods=['PUT'])
def update_section(section_id):
    """
    Обновить существующую секцию
    ---
    tags:
      - Секции
    parameters:
      - name: section_id
        in: path
        type: integer
        required: true
        description: ID секции для обновления
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Йога"
    responses:
      200:
        description: Секция обновлена
        schema:
          type: object
          properties:
            id:
              type: integer
              example: 1
            name:
              type: string
              example: "Йога"
      404:
        description: Секция не найдена
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Секция не найдена"
    """
    section = Section.query.get(section_id)
    if not section:
        return jsonify({"error": "Секция не найдена"}), 404

    data = request.json
    section.name = data.get("name", section.name)
    db.session.commit()
    return jsonify({"id": section.id, "name": section.name})


# DELETE: удалить секцию
@sections_bp.route('/<int:section_id>', methods=['DELETE'])
def delete_section(section_id):
    """
    Удалить секцию
    ---
    tags:
      - Секции
    parameters:
      - name: section_id
        in: path
        type: integer
        required: true
        description: ID секции для удаления
    responses:
      200:
        description: Секция удалена
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Секция Футбол удалена"
      404:
        description: Секция не найдена
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Секция не найдена"
    """
    section = Section.query.get(section_id)
    if not section:
        return jsonify({"error": "Секция не найдена"}), 404

    db.session.delete(section)
    db.session.commit()
    return jsonify({"message": f"Секция {section.name} удалена"})


# POST: регистрация пользователя в секцию
@sections_bp.route('/register', methods=['POST'])
def register_section():
    """
    Зарегистрировать пользователя в секции
    ---
    tags:
      - Секции
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            section:
              type: string
              example: "Футбол"
            user:
              type: string
              example: "ivan"
    responses:
      200:
        description: Данные регистрации
        schema:
          type: object
          properties:
            user:
              type: string
              example: "ivan"
            section:
              type: string
              example: "Футбол"
      400:
        description: Ошибка входных данных
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Не указаны обязательные поля"
      404:
        description: Пользователь или секция не найдены
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Пользователь не найден"
    """
    data = request.json
    if not data or "user" not in data or "section" not in data:
        return jsonify({"error": "Не указаны обязательные поля"}), 400

    user = User.query.filter_by(username=data["user"]).first()
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    section = Section.query.filter_by(name=data["section"]).first()
    if not section:
        return jsonify({"error": "Секция не найдена"}), 404

    return jsonify({
        "user": user.username,
        "section": section.name
    })
