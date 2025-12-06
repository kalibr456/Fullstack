import json
import requests
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin
from app.extensions import db
from app.models import Training, DailyAdvice
from datetime import date, datetime

ai_bp = Blueprint('ai', __name__, url_prefix='/ai')

def generate_decision_and_prompt(history):
    if not history:
        # Для новичка отдаем готовые данные, не тревожим ИИ зря
        return None, None
    
    last_training = history[0]
    days_since = (date.today() - last_training.date.date()).days
    last_int = last_training.intensity
    
    # --- 1. ЖЕЛЕЗНАЯ ЛОГИКА PYTHON (Она не ошибается) ---
    
    # Сценарий А: Перетренированность (Тяжело + Недавно)
    if last_int >= 8 and days_since <= 1:
        target_status = "rest"
        target_intensity = 2
        ai_instruction = "Атлет переутомлен (нагрузка была предельной). Твоя задача: КАТЕГОРИЧЕСКИ ЗАПРЕТИТЬ тяжелые нагрузки. Посоветуй полный отдых или прогулку."
    
    # Сценарий Б: Халява (Легко + Недавно)
    elif last_int <= 4 and days_since <= 2:
        target_status = "progress"
        target_intensity = 9
        ai_instruction = "Атлет расслабился (прошлая тренировка была слишком легкой). Твоя задача: ДАТЬ ВОЛШЕБНЫЙ ПИНОК. Требуй выложиться на 100%."
    
    # Сценарий В: Долгий перерыв (> 4 дней)
    elif days_since > 4:
        target_status = "recovery"
        target_intensity = 5
        ai_instruction = "Атлет давно не занимался. Нельзя резко начинать. Посоветуй втягивающую тренировку, чтобы не получить травму."
        
    # Сценарий Г: Нормальный режим
    else:
        target_status = "progress"
        # Небольшая прогрессия
        target_intensity = min(last_int + 1, 9) 
        ai_instruction = "Атлет в хорошем ритме. Похвали и предложи немного усложнить задачу."

    # --- 2. ФОРМИРУЕМ ПРОМПТ ТОЛЬКО ДЛЯ ТЕКСТА ---
    # Мы уже всё решили за ИИ, ему нужно только написать красивый текст.
    
    prompt_text = f"""
    Ты спортивный тренер.
    
    СИТУАЦИЯ:
    Последняя тренировка была {days_since} дн. назад с нагрузкой {last_int}/10.
    
    ТВОЯ ЗАДАЧА:
    {ai_instruction}
    
    СФОРМИРУЙ ОТВЕТ В JSON:
    {{
        "message": "Твой совет на русском языке (дерзкий или заботливый, в зависимости от задачи, макс 20 слов)"
    }}
    (Поля status и suggested_intensity я заполню сам, от тебя нужен только message).
    """
    
    # Возвращаем и промпт, и уже рассчитанные цифры
    return prompt_text, {"status": target_status, "intensity": target_intensity}

@ai_bp.route('/recommend', methods=['GET', 'OPTIONS'])
@cross_origin()
@jwt_required()
def recommend_load():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    user_id = int(get_jwt_identity())
    today = date.today()

    # 1. ПРОВЕРКА КЭША
    existing_advice = DailyAdvice.query.filter_by(user_id=user_id, date=today).first()
    if existing_advice:
        return jsonify({
            "status": existing_advice.status,
            "message": existing_advice.message,
            "suggested_intensity": existing_advice.suggested_intensity,
            "from_cache": True
        })

    # 2. ПОЛУЧЕНИЕ ИСТОРИИ
    history = Training.query.filter_by(user_id=user_id)\
                            .order_by(Training.date.desc())\
                            .limit(5).all()

    # 3. ГЕНЕРАЦИЯ РЕШЕНИЯ (PYTHON)
    prompt, decision = generate_decision_and_prompt(history)
    
    # Если новичок
    if prompt is None:
        return jsonify({
            "status": "beginner",
            "message": "Добро пожаловать в мир спорта! Начнем плавно.",
            "suggested_intensity": 3
        })


    # 4. ГЕНЕРАЦИЯ ТЕКСТА (OLLAMA)
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen2.5:3b",
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.4}
            },
            timeout=10
        )
        
        ai_response = response.json()
        raw_text = ai_response.get("response", "{}")
        ai_data = json.loads(raw_text)
        
        # БЕРЕМ СООБЩЕНИЕ ОТ ИИ, А ЦИФРЫ — ОТ PYTHON
        final_message = ai_data.get("message", "Следуйте плану.")
        
        # Сохранение
        new_advice = DailyAdvice(
            user_id=user_id,
            date=today,
            status=decision['status'],         # <--- Берем из Python
            message=final_message,             # <--- Берем от ИИ
            suggested_intensity=decision['intensity'] # <--- Берем из Python
        )
        db.session.add(new_advice)
        db.session.commit()
        
        return jsonify({
            "status": new_advice.status,
            "message": new_advice.message,
            "suggested_intensity": new_advice.suggested_intensity
        })

    except Exception as e:
        print(f"❌ AI Error: {e}")
        # Если ИИ упал, у нас все равно есть рассчитанные цифры!
        return jsonify({
            "status": decision['status'],
            "message": "ИИ молчит, но математика советует вот это.",
            "suggested_intensity": decision['intensity']
        })