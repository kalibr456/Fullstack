from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Training, Section

training_bp = Blueprint('training', __name__, url_prefix='/training')

# ===============================
# GET: все тренировки пользователя
# ===============================
@training_bp.route('/', methods=['GET'])
@jwt_required()
def get_trainings():
    """
    Получить список всех тренировок
    ---
    tags:
      - Trainings
    security:
      - Bearer: []
    responses:
      200:
        description: Список тренировок успешно получен
        schema:
          properties:
            trainings:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  section:
                    type: string
                  date:
                    type: string
                  duration:
                    type: integer
                  intensity:
                    type: integer
                  note:
                    type: string
    """
    user_id = get_jwt_identity()
    trainings = Training.query.filter_by(user_id=user_id).order_by(Training.date.desc()).all()
    return jsonify({
        "trainings": [t.to_dict() for t in trainings]
    })


# ===============================
# POST: добавить тренировку
# ===============================
@training_bp.route('/', methods=['POST'])
@jwt_required()
def add_training():
    """
    Добавить новую тренировку
    ---
    tags:
      - Trainings
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
              description: ID секции
              example: 1
            duration:
              type: integer
              description: Длительность в минутах
              example: 60
            intensity:
              type: integer
              description: Интенсивность (1-10)
              example: 8
            note:
              type: string
              description: Заметка
              example: "Было тяжело"
    responses:
      201:
        description: Тренировка создана
      400:
        description: Не указан ID секции
      404:
        description: Секция не найдена
    """
    user_id = get_jwt_identity()
    data = request.json

    if not data or "section_id" not in data:
        return jsonify({"error": "Не указан ID секции"}), 400

    section = db.session.get(Section, data["section_id"])
    if not section:
        return jsonify({"error": "Секция не найдена"}), 404

    new_training = Training(
        user_id=user_id,
        section_id=section.id,
        duration=data.get("duration"),
        intensity=data.get("intensity"),
        note=data.get("note")
    )

    db.session.add(new_training)
    db.session.commit()

    return jsonify({
        "message": "Тренировка добавлена",
        "training": new_training.to_dict()
    }), 201


# ===============================
# PUT: обновить тренировку
# ===============================
@training_bp.route('/<int:training_id>', methods=['PUT'])
@jwt_required()
def update_training(training_id):
    """
    Обновить данные тренировки
    ---
    tags:
      - Trainings
    security:
      - Bearer: []
    parameters:
      - in: path
        name: training_id
        type: integer
        required: true
        description: ID тренировки
      - in: body
        name: body
        schema:
          type: object
          properties:
            duration:
              type: integer
            intensity:
              type: integer
            note:
              type: string
    responses:
      200:
        description: Обновлено успешно
      403:
        description: Недостаточно прав
      404:
        description: Тренировка не найдена
    """
    user_id = get_jwt_identity()
    training = db.session.get(Training, training_id)

    if not training:
        return jsonify({"error": "Тренировка не найдена"}), 404

    if str(training.user_id) != str(user_id):
        return jsonify({"error": "Недостаточно прав"}), 403

    data = request.json
    
    if "duration" in data:
        training.duration = data["duration"]
    if "intensity" in data:
        training.intensity = data["intensity"]
    if "note" in data:
        training.note = data["note"]

    db.session.commit()

    return jsonify(training.to_dict())


# ===============================
# DELETE: удалить тренировку
# ===============================
@training_bp.route('/<int:training_id>', methods=['DELETE'])
@jwt_required()
def delete_training(training_id):
    """
    Удалить тренировку
    ---
    tags:
      - Trainings
    security:
      - Bearer: []
    parameters:
      - in: path
        name: training_id
        type: integer
        required: true
        description: ID тренировки
    responses:
      200:
        description: Удалено успешно
      403:
        description: Недостаточно прав
      404:
        description: Тренировка не найдена
    """
    user_id = get_jwt_identity()
    training = db.session.get(Training, training_id)

    if not training:
        return jsonify({"error": "Тренировка не найдена"}), 404

    if str(training.user_id) != str(user_id):
        return jsonify({"error": "Недостаточно прав"}), 403

    db.session.delete(training)
    db.session.commit()
    
    return jsonify({"message": "Тренировка удалена"})