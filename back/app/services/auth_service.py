from flask_jwt_extended import create_access_token, create_refresh_token, decode_token
from datetime import timedelta, datetime

class AuthService:
    def __init__(self, auth_repo):
        self.auth_repo = auth_repo

    def login_user(self, username, password):
        user = self.auth_repo.get_user_by_username(username)
        if user and user.check_password(password):
            access = create_access_token(identity=str(user.id), expires_delta=timedelta(minutes=15))
            refresh = create_refresh_token(identity=str(user.id), expires_delta=timedelta(days=30))
            return {"access": access, "refresh": refresh, "role": user.role}
        return None