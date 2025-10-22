from flask import Blueprint, request, jsonify

ai_bp = Blueprint('ai', __name__, url_prefix='/ai')

@ai_bp.route('/recommend', methods=['POST'])
def recommend():
    """
    Получить рекомендацию по нагрузке
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
      200:
        description: Рекомендация по нагрузке
    """
    data = request.json.get('trainings', [])
    avg_intensity = sum(t.get('intensity', 0) for t in data) / len(data) if data else 0

    if avg_intensity < 5:
        rec = "Можно увеличить нагрузку."
    elif avg_intensity > 8:
        rec = "Снизьте интенсивность, дайте мышцам восстановиться."
    else:
        rec = "Продолжайте в том же духе!"

    return {"recommendation": rec, "average_intensity": avg_intensity}
