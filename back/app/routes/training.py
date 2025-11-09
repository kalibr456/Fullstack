from flask import Blueprint, jsonify, request
from app import db
from app.models import Training

training_bp = Blueprint('training', __name__, url_prefix='/training')


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
        schema:
          type: object
          properties:
            trainings:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                    example: 1
                  user:
                    type: string
                    example: "ivan"
                  section:
                    type: string
                    example: "Футбол"
                  duration:
                    type: number
                    example: 60
                  intensity:
                    type: number
                    example: 7
    """
    trainings = Training.query.all()
    return jsonify({
        "trainings": [
            {
                "id": t.id,
                "user": t.user,
                "section": t.section,
                "duration": t.duration,
                "intensity": t.intensity
            } for t in trainings
        ]
    })


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
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Тренировка добавлена"
            data:
              type: object
              properties:
                id:
                  type: integer
                  example: 1
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
    """
    data = request.json
    if not data or not all(k in data for k in ("user", "section", "duration", "intensity")):
        return jsonify({"error": "Не указаны все обязательные поля"}), 400

    training = Training(
        user=data["user"],
        section=data["section"],
        duration=data["duration"],
        intensity=data["intensity"]
    )
    db.session.add(training)
    db.session.commit()

    return jsonify({
        "message": "Тренировка добавлена",
        "data": {
            "id": training.id,
            "user": training.user,
            "section": training.section,
            "duration": training.duration,
            "intensity": training.intensity
        }
    }), 201


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
        schema:
          type: object
          properties:
            id:
              type: integer
              example: 1
            user:
              type: string
              example: "ivan"
            section:
              type: string
              example: "Футбол"
            duration:
              type: number
              example: 50
            intensity:
              type: number
              example: 6
      404:
        description: Тренировка не найдена
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Тренировка не найдена"
    """
    training = Training.query.filter_by(user=user, section=section).first()
    if not training:
        return jsonify({"error": "Тренировка не найдена"}), 404

    data = request.json
    if "duration" in data:
        training.duration = data["duration"]
    if "intensity" in data:
        training.intensity = data["intensity"]

    db.session.commit()

    return jsonify({
        "id": training.id,
        "user": training.user,
        "section": training.section,
        "duration": training.duration,
        "intensity": training.intensity
    })


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
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Тренировка Футбол пользователя ivan удалена"
      404:
        description: Тренировка не найдена
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Тренировка не найдена"
    """
    training = Training.query.filter_by(user=user, section=section).first()
    if not training:
        return jsonify({"error": "Тренировка не найдена"}), 404

    db.session.delete(training)
    db.session.commit()
    return jsonify({"message": f"Тренировка {section} пользователя {user} удалена"})
