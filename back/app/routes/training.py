from flask import Blueprint, request, jsonify

training_bp = Blueprint('training', __name__, url_prefix='/training')

trainings = [
    {"user": "ivan", "section": "Футбол", "duration": 60, "intensity": 7}
]

@training_bp.route('/', methods=['GET'])
def get_trainings():
    """
    Получить все тренировки
    ---
    tags:
      - Тренировки
    responses:
      200:
        description: Список всех тренировок
    """
    return {"trainings": trainings}

@training_bp.route('/', methods=['POST'])
def add_training():
    """
    Добавить тренировку
    ---
    tags:
      - Тренировки
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            user:
              type: string
            section:
              type: string
            duration:
              type: number
            intensity:
              type: number
    responses:
      201:
        description: Тренировка добавлена
    """
    data = request.json
    trainings.append(data)
    return {"message": "Тренировка добавлена", "data": data}, 201
