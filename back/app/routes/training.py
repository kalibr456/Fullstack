import uuid
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Training, Section, DailyAdvice
from app.services.s3_service import S3Service 
from datetime import datetime, date
from sqlalchemy import func # Импортируем func для работы с датами в SQL

training_bp = Blueprint('training', __name__, url_prefix='/training')
s3_service = S3Service()

# ==========================================================
# GET: Список с фильтрацией по ДАТЕ, поиском и пагинацией
# ==========================================================
@training_bp.route('/', methods=['GET'])
@jwt_required()
def get_trainings():
    user_id = get_jwt_identity()
    
    # 1. Сбор параметров из URL
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 5, type=int)
    search = request.args.get('search', '', type=str)
    section_id = request.args.get('section_id', None, type=int)
    sort = request.args.get('sort', 'date_desc', type=str)
    
    # НОВОЕ: Получаем дату фильтрации (например "2026-03-26")
    filter_date_str = request.args.get('date', None, type=str) 

    # 2. Построение базового запроса
    query = Training.query.filter_by(user_id=user_id)

    # Фильтр по тексту (поиск в заметках)
    if search:
        query = query.filter(Training.note.ilike(f"%{search}%"))
    
    # Фильтр по секции
    if section_id:
        query = query.filter(Training.section_id == section_id)

    # НОВОЕ: Фильтрация по конкретной дате (Пункт 3.1 лабораторной)
    # Сравниваем только дату в БД (без учета часов/минут) с присланной датой
    if filter_date_str:
        try:
            target_date = datetime.strptime(filter_date_str, "%Y-%m-%d").date()
            query = query.filter(func.date(Training.date) == target_date)
        except ValueError:
            pass # Если формат даты неверный, игнорируем фильтр

    # Сортировка
    if sort == 'date_asc':
        query = query.order_by(Training.date.asc())
    elif sort == 'intensity_desc':
        query = query.order_by(Training.intensity.desc())
    else:
        query = query.order_by(Training.date.desc())

    # 3. Выполнение серверной пагинации
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    trainings_list = []
    for t in pagination.items:
        d = t.to_dict()
        if t.file_key:
            d['file_url'] = s3_service.get_url(t.file_key)
        trainings_list.append(d)

    return jsonify({
        "trainings": trainings_list,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    })


# ==========================================================
# POST: Добавить тренировку (Исправлен парсинг даты)
# ==========================================================
@training_bp.route('/', methods=['POST'])
@jwt_required()
def add_training():
    user_id = get_jwt_identity()
    data = request.form 
    file = request.files.get('file')

    if not data.get("section_id"):
        return jsonify({"error": "Не указан ID секции"}), 400

    # Загрузка в S3
    file_key = None
    if file:
        file.seek(0, 2)
        size = file.tell()
        file.seek(0)
        if size > 5 * 1024 * 1024:
            return jsonify({"error": "Файл слишком большой (макс 5МБ)"}), 400

        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
        filename = f"user_{user_id}/{uuid.uuid4()}.{ext}"
        
        try:
            file_key = s3_service.upload_file(file, filename, file.content_type)
        except Exception as e:
            return jsonify({"error": f"Ошибка S3: {str(e)}"}), 500

    # Чтение даты из запроса (поддержка формата YYYY-MM-DD)
    training_date = datetime.utcnow()
    date_val = data.get("date")
    if date_val:
        try:
            # Сначала пробуем простой формат ГГГГ-ММ-ДД
            training_date = datetime.strptime(date_val, "%Y-%m-%d")
        except ValueError:
            try:
                # Если не вышло, пробуем ISO формат
                training_date = datetime.fromisoformat(date_val.replace('Z', ''))
            except:
                pass

    new_training = Training(
        user_id=user_id,
        section_id=int(data.get("section_id")),
        duration=int(data.get("duration", 30)),
        intensity=int(data.get("intensity", 5)),
        note=data.get("note", ""),
        date=training_date,
        file_key=file_key
    )

    db.session.add(new_training)
    
    # Сброс кэша ИИ
    today_advice = DailyAdvice.query.filter_by(user_id=user_id, date=date.today()).first()
    if today_advice:
        db.session.delete(today_advice)

    db.session.commit()
    return jsonify({"message": "Создано", "training": new_training.to_dict()}), 201


# ==========================================================
# DELETE: Остается без изменений
# ==========================================================
@training_bp.route('/<int:training_id>', methods=['DELETE'])
@jwt_required()
def delete_training(training_id):
    user_id = get_jwt_identity()
    training = db.session.get(Training, training_id)

    if not training or str(training.user_id) != str(user_id):
        return jsonify({"error": "Не найдено"}), 404

    if training.file_key:
        try:
            s3_service.delete_file(training.file_key)
        except:
            pass

    db.session.delete(training)
    
    today_advice = DailyAdvice.query.filter_by(user_id=user_id, date=date.today()).first()
    if today_advice:
        db.session.delete(today_advice)

    db.session.commit()
    return jsonify({"message": "Удалено успешно"})