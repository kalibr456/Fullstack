from flask import Blueprint, jsonify, request

sections_bp = Blueprint('sections', __name__, url_prefix='/sections')

sections = [
    {"id": 1, "name": "Футбол"},
    {"id": 2, "name": "Плавание"},
    {"id": 3, "name": "Тяжелая атлетика"}
]

next_id = 4

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
        examples:
          application/json:
            sections:
              - id: 1
                name: "Футбол"
              - id: 2
                name: "Плавание"
              - id: 3
                name: "Тяжелая атлетика"
    """
    return {"sections": sections}

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
        examples:
          application/json:
            id: 4
            name: "Йога"
    """
    global next_id
    data = request.json
    new_section = {"id": next_id, "name": data["name"]}
    next_id += 1
    sections.append(new_section)
    return jsonify(new_section), 201

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
        examples:
          application/json:
            id: 1
            name: "Йога"
      404:
        description: Секция не найдена
        examples:
          application/json:
            error: "Секция не найдена"
    """
    data = request.json
    section = next((s for s in sections if s["id"] == section_id), None)
    if not section:
        return jsonify({"error": "Секция не найдена"}), 404
    section["name"] = data.get("name", section["name"])
    return jsonify(section)

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
        examples:
          application/json:
            message: "Секция Футбол удалена"
      404:
        description: Секция не найдена
        examples:
          application/json:
            error: "Секция не найдена"
    """
    global sections
    section = next((s for s in sections if s["id"] == section_id), None)
    if not section:
        return jsonify({"error": "Секция не найдена"}), 404
    sections = [s for s in sections if s["id"] != section_id]
    return jsonify({"message": f"Секция {section['name']} удалена"})

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
        description: Успешная регистрация
        examples:
          application/json:
            message: "Пользователь ivan записан в секцию Футбол"
    """
    data = request.json
    return {"message": f"Пользователь {data['user']} записан в секцию {data['section']}"}


