from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# Таблица связи many-to-many: users <-> sections
user_sections = db.Table(
    'user_sections',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('section_id', db.Integer, db.ForeignKey('section.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sections = db.relationship('Section', secondary=user_sections, back_populates='users')
    trainings = db.relationship('Training', back_populates='user', cascade="all, delete-orphan")
    diary_entries = db.relationship('DiaryEntry', back_populates='user', cascade="all, delete-orphan")
    advices = db.relationship('DailyAdvice', back_populates='user', cascade="all, delete-orphan")
    tokens = db.relationship('TokenBlocklist', back_populates='user', cascade="all, delete-orphan")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_email=False):
        d = {
            "id": self.id,
            "username": self.username,
            "role": self.role,  
            "created_at": self.created_at.isoformat()
        }
        if include_email:
            d["email"] = self.email
        d["sections"] = [s.to_dict() for s in self.sections]
        return d

class Section(db.Model):
    __tablename__ = 'section'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False, index=True)
    description = db.Column(db.String(500), nullable=True)
    users = db.relationship('User', secondary=user_sections, back_populates='sections')

    def to_dict(self):
        return {"id": self.id, "name": self.name, "description": self.description}

class Training(db.Model):
    __tablename__ = 'training'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    duration = db.Column(db.Integer)
    intensity = db.Column(db.Integer)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    note = db.Column(db.String(500), nullable=True)
    
    # ПУНКТ 1.3 и 5.1: Ключ файла (путь к картинке в MinIO)
    file_key = db.Column(db.String(255), nullable=True) 

    user = db.relationship('User', back_populates='trainings')
    section = db.relationship('Section')

    def to_dict(self):
        return {
            "id": self.id,
            "user": self.user.username if self.user else None,
            "section": self.section.name if self.section else None,
            "section_id": self.section_id, # Добавил для удобства фильтрации на фронте
            "duration": self.duration,
            "intensity": self.intensity,
            "date": self.date.isoformat(),
            "note": self.note,
            "file_key": self.file_key
        }

class DiaryEntry(db.Model):
    __tablename__ = 'diary_entry'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    section = db.Column(db.String(120))  
    date = db.Column(db.Date, nullable=False)
    note = db.Column(db.String(1000))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', back_populates='diary_entries')

    def to_dict(self):
        return {
            "id": self.id,
            "user": self.user.username if self.user else None,
            "section": self.section,
            "date": self.date.isoformat(),
            "note": self.note,
            "created_at": self.created_at.isoformat()
        }

class DailyAdvice(db.Model):
    __tablename__ = 'daily_advice'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50))      
    message = db.Column(db.String(500))    
    suggested_intensity = db.Column(db.Integer) 
    user = db.relationship('User', back_populates='advices')

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "status": self.status,
            "message": self.message,
            "suggested_intensity": self.suggested_intensity
        }

class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True) 
    token_type = db.Column(db.String(10), nullable=False)      
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    revoked = db.Column(db.Boolean, default=False)             
    expires = db.Column(db.DateTime, nullable=False)           
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', back_populates='tokens')