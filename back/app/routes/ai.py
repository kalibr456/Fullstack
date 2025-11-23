from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Training
from datetime import datetime

ai_bp = Blueprint('ai', __name__, url_prefix='/ai')

@ai_bp.route('/recommend', methods=['GET'])
@jwt_required()
def recommend_load():
    """
    Получить рекомендацию ИИ по нагрузке
    ---
    tags:
      - AI
    security:
      - Bearer: []
    responses:
      200:
        description: Рекомендация получена
    """
    user_id = get_jwt_identity()
    
    # 1. Получаем последние 5 тренировок пользователя
    history = Training.query.filter_by(user_id=user_id)\
                            .order_by(Training.date.desc())\
                            .limit(5).all()

    # Сценарий 0: Новичок
    if not history:
        return jsonify({
            "status": "beginner",
            "message": "Привет! Ты только начинаешь. Рекомендую начать с легкой тренировки (30-40 мин) с низкой интенсивностью, чтобы привыкнуть к ритму.",
            "suggested_intensity": 3
        })

    last_training = history[0]
    # Вычисляем, сколько дней прошло с последней тренировки
    # last_training.date может быть строкой или datetime, приведем к безопасному виду
    last_date = last_training.date
    if isinstance(last_date, str):
        last_date = datetime.fromisoformat(last_date)
        
    days_since_last = (datetime.utcnow() - last_date).days

    # Сценарий 1: Долгий перерыв (больше 7 дней)
    if days_since_last > 7:
        return jsonify({
            "status": "recovery",
            "message": f"Ты не тренировался {days_since_last} дней. Не спеши ставить рекорды. Проведи втягивающую тренировку на технику.",
            "suggested_intensity": 4
        })

    # Сценарий 2: Перетренированность (вчера была жесткая тренировка)
    # Если тренировка была менее 24 часов назад И интенсивность была > 7
    if days_since_last < 1 and last_training.intensity > 7:
        return jsonify({
            "status": "rest",
            "message": "Вчера ты отлично поработал! Сегодня организму нужен отдых или очень легкое кардио/йога для восстановления.",
            "suggested_intensity": 2
        })

    # Сценарий 3: Прогрессия (регулярные тренировки)
    # Считаем среднюю интенсивность за последние разы
    avg_intensity = sum([t.intensity for t in history]) / len(history)
    
    suggested = min(int(avg_intensity) + 1, 10) # Предлагаем чуть сложнее, но не больше 10

    return jsonify({
        "status": "progress",
        "message": "Ты в отличной форме! Пора немного увеличить нагрузку. Попробуй повысить интенсивность или добавить 10 минут к времени.",
        "suggested_intensity": suggested
    })