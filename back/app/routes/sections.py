from flask import Blueprint, jsonify, request

sections_bp = Blueprint('sections', __name__, url_prefix='/sections')

sections = [
    {"id": 1, "name": "Фу"},
    {"id": 2, "name": "Плавание"},
    {"id": 3, "name": "Тяжелая атлетика"}
]

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
    """
    return {"sections": sections}


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
            message: "Пользователь записан в секцию Футбол"
    """
    data = request.json
    return {"message": f"Пользователь записан в секцию {data['section']}"}


