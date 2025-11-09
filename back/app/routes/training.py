from flask import Blueprint, jsonify, request

training_bp = Blueprint('training', __name__, url_prefix='/training')

trainings = [
    {"user": "ivan", "section": "Футбол", "duration": 60, "intensity": 7}
]

# GET: все тренировки
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
        examples:
          application/json:
            trainings:
              - user: "ivan"
                section: "Футбол"
                duration: 60
                intensity: 7
    """
    return {"trainings": trainings}

# POST: добавить тренировку
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
          type: object
          properties:
            user:
              type: string
              example: "ivan"
            section:
              type: string
              example: "Йога"
            duration:
              type: number
              example: 45
            intensity:
              type: number
              example: 5
    responses:
      201:
        description: Тренировка добавлена
        examples:
          application/json:
            message: "Тренировка добавлена"
            data:
              user: "ivan"
              section: "Йога"
              duration: 45
              intensity: 5
    """
    data = request.json
    trainings.append(data)
    return {"message": "Тренировка добавлена", "data": data}, 201

# PUT: обновить тренировку по user и section
@training_bp.route('/<user>/<section>', methods=['PUT'])
def update_training(user, section):
    """
    Обновить тренировку пользователя
    ---
    tags:
      - Тренировки
    parameters:
      - name: user
        in: path
        type: string
        required: true
      - name: section
        in: path
        type: string
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            duration:
              type: number
              example: 50
            intensity:
              type: number
              example: 6
    responses:
      200:
        description: Тренировка обновлена
      404:
        description: Тренировка не найдена
    """
    data = request.json
    training = next((t for t in trainings if t["user"] == user and t["section"] == section), None)
    if not training:
        return jsonify({"error": "Тренировка не найдена"}), 404
    training.update({k: v for k, v in data.items() if k in ["duration", "intensity"]})
    return jsonify(training)

# DELETE: удалить тренировку
@training_bp.route('/<user>/<section>', methods=['DELETE'])
def delete_training(user, section):
    """
    Удалить тренировку пользователя
    ---
    tags:
      - Тренировки
    parameters:
      - name: user
        in: path
        type: string
        required: true
      - name: section
        in: path
        type: string
        required: true
    responses:
      200:
        description: Тренировка удалена
      404:
        description: Тренировка не найдена
    """
    global trainings
    training = next((t for t in trainings if t["user"] == user and t["section"] == section), None)
    if not training:
        return jsonify({"error": "Тренировка не найдена"}), 404
    trainings = [t for t in trainings if not (t["user"] == user and t["section"] == section)]
    return jsonify({"message": f"Тренировка {section} пользователя {user} удалена"})
