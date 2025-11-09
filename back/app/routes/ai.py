from flask import Blueprint, request, jsonify

ai_bp = Blueprint('ai', __name__, url_prefix='/ai')

# Храним рекомендации в памяти (для примера)
recommendations = []
next_id = 1

# CREATE + POST /ai/recommend
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
    responses:
      201:
        description: Рекомендация создана
    """
    global next_id
    data = request.json.get('trainings', [])
    avg_intensity = sum(t.get('intensity', 0) for t in data) / len(data) if data else 0

    if avg_intensity < 5:
        rec_text = "Можно увеличить нагрузку."
    elif avg_intensity > 8:
        rec_text = "Снизьте интенсивность, дайте мышцам восстановиться."
    else:
        rec_text = "Продолжайте в том же духе!"

    rec = {
        "id": next_id,
        "trainings": data,
        "average_intensity": avg_intensity,
        "recommendation": rec_text
    }
    next_id += 1
    recommendations.append(rec)
    return jsonify(rec), 201

# READ: получить все рекомендации
@ai_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """
    Получить все рекомендации
    ---
    tags:
      - AI
    responses:
      200:
        description: Список рекомендаций
    """
    return jsonify({"recommendations": recommendations})

# UPDATE: изменить рекомендацию по id
@ai_bp.route('/recommendations/<int:rec_id>', methods=['PUT'])
def update_recommendation(rec_id):
    """
    Обновить рекомендацию
    ---
    tags:
      - AI
    parameters:
      - name: rec_id
        in: path
        type: integer
        required: true
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
    responses:
      200:
        description: Рекомендация обновлена
      404:
        description: Рекомендация не найдена
    """
    rec = next((r for r in recommendations if r["id"] == rec_id), None)
    if not rec:
        return jsonify({"error": "Рекомендация не найдена"}), 404

    data = request.json.get("trainings", [])
    avg_intensity = sum(t.get('intensity', 0) for t in data) / len(data) if data else 0

    if avg_intensity < 5:
        rec_text = "Можно увеличить нагрузку."
    elif avg_intensity > 8:
        rec_text = "Снизьте интенсивность, дайте мышцам восстановиться."
    else:
        rec_text = "Продолжайте в том же духе!"

    rec.update({
        "trainings": data,
        "average_intensity": avg_intensity,
        "recommendation": rec_text
    })
    return jsonify(rec)

# DELETE: удалить рекомендацию
@ai_bp.route('/recommendations/<int:rec_id>', methods=['DELETE'])
def delete_recommendation(rec_id):
    """
    Удалить рекомендацию
    ---
    tags:
      - AI
    parameters:
      - name: rec_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Рекомендация удалена
      404:
        description: Рекомендация не найдена
    """
    global recommendations
    rec = next((r for r in recommendations if r["id"] == rec_id), None)
    if not rec:
        return jsonify({"error": "Рекомендация не найдена"}), 404

    recommendations = [r for r in recommendations if r["id"] != rec_id]
    return jsonify({"message": "Рекомендация удалена"})
