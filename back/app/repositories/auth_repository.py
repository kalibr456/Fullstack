from app.models import User, TokenBlocklist
from app.extensions import db

class AuthRepository:
    def get_user_by_username(self, username):
        return User.query.filter_by(username=username).first()

    def save_token(self, token_data):
        db.session.add(token_data)
        db.session.commit()

    def is_token_revoked(self, jti):
        token = TokenBlocklist.query.filter_by(jti=jti, revoked=True).first()
        return token is not None