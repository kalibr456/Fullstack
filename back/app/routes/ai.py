from flask import Blueprint, request, jsonify
from app import db
from app.models import Training  # используем модель Training
from datetime import datetime

ai_bp = Blueprint('ai', __name__, url_prefix='/ai')

# POST /ai/recommend — создать рекомендацию
@ai_bp.route('/recommend', methods=['POST'])
def recommend():
    """
    Получить рекомендацию по нагрузке и сохранить
    ---
    tags:
      - AI
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            trainings:
              type: array
              items:
                type: object
                properties:
                  intensity:
                    type: number
                  user:
                    type: string
                  section:
                    type: string
                  duration:
                    type: number
    responses:
      201:
        description: Рекомендация создана
    """
    data = request.json.get('trainings', [])
    if not isinstance(data, list):
        return jsonify({"error": "Поле 'trainings' должно быть списком"}), 400

    avg_intensity = sum(t.get('intensity', 0) for t in data) / len(data) if data else 0

    if not data:
        rec_text = "Добавьте хотя бы одну тренировку для анализа."
    elif avg_intensity < 5:
        rec_text = "Можно увеличить нагрузку."
    elif avg_intensity > 8:
        rec_text = "Снизьте интенсивность, дайте мышцам восстановиться."
    else:
        rec_text = "Продолжайте в том же духе!"

    trainings_records = []
    for t in data:
        training = Training(
            user=t.get('user', 'unknown'),
            section=t.get('section', 'general'),
            duration=t.get('duration', 0),
            intensity=t.get('intensity', 0)
        )
        db.session.add(training)
        trainings_records.append(training)

    db.session.commit()  # сохраняем все тренировки

    return jsonify({
        "trainings": [
            {
                "id": tr.id,
                "user": tr.user,
                "section": tr.section,
                "duration": tr.duration,
                "intensity": tr.intensity
            } for tr in trainings_records
        ],
        "average_intensity": avg_intensity,
        "recommendation": rec_text
    }), 201


# GET /ai/recommendations — получить все тренировки
@ai_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    trainings = Training.query.all()
    return jsonify({
        "recommendations": [
            {
                "id": t.id,
                "user": t.user,
                "section": t.section,
                "duration": t.duration,
                "intensity": t.intensity
            } for t in trainings
        ]
    })


# PUT /ai/recommendations/<int:rec_id> — обновить тренировку
@ai_bp.route('/recommendations/<int:rec_id>', methods=['PUT'])
def update_recommendation(rec_id):
    t = Training.query.get(rec_id)
    if not t:
        return jsonify({"error": "Тренировка не найдена"}), 404

    data = request.json
    t.user = data.get('user', t.user)
    t.section = data.get('section', t.section)
    t.duration = data.get('duration', t.duration)
    t.intensity = data.get('intensity', t.intensity)

    db.session.commit()

    return jsonify({
        "id": t.id,
        "user": t.user,
        "section": t.section,
        "duration": t.duration,
        "intensity": t.intensity
    })


# DELETE /ai/recommendations/<int:rec_id> — удалить тренировку
@ai_bp.route('/recommendations/<int:rec_id>', methods=['DELETE'])
def delete_recommendation(rec_id):
    t = Training.query.get(rec_id)
    if not t:
        return jsonify({"error": "Тренировка не найдена"}), 404

    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "Тренировка удалена"})
