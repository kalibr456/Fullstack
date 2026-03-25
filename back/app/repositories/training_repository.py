from app.models import Training
from sqlalchemy import or_

class TrainingRepository:
    def get_filtered(self, user_id, args):
        query = Training.query.filter_by(user_id=user_id)

        # 1. Поиск (Пункт 2.2)
        search = args.get('search')
        if search:
            query = query.filter(Training.note.ilike(f"%{search}%"))

        # 2. Фильтрация (Пункт 2.1)
        section_id = args.get('section_id')
        if section_id:
            query = query.filter(Training.section_id == section_id)
            
        min_intensity = args.get('min_intensity')
        if min_intensity:
            query = query.filter(Training.intensity >= int(min_intensity))

        # 3. Сортировка (Пункт 2.3)
        sort = args.get('sort', 'date_desc')
        if sort == 'date_asc': query = query.order_by(Training.date.asc())
        elif sort == 'intensity_desc': query = query.order_by(Training.intensity.desc())
        else: query = query.order_by(Training.date.desc())

        # 4. Пагинация (Пункт 2.3)
        page = int(args.get('page', 1))
        per_page = int(args.get('per_page', 5))
        
        return query.paginate(page=page, per_page=per_page, error_out=False)