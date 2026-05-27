# backend/modules/auth/auth_service.py
import uuid
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models.user import User
from backend.extensions import db

class AuthService:
    @staticmethod
    def login(email, password):
        user = User.query.filter(
            (User.email == email) | (User.username == email)
        ).first()

        # Support both plaintext (legacy) and bcrypt for smooth transition,
        # but the plan is to migrate all to bcrypt.
        is_valid = False
        if user:
            try:
                is_valid = check_password_hash(user.password_hash, password)
            except ValueError:
                # Fallback for plain text password if not migrated yet
                is_valid = (user.password_hash == password)
                
        if user and is_valid:
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            user_data = {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "position": user.position,
                "department": user.department,
                "phone": user.phone,
                "full_name": user.full_name or user.username
            }
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={"role": user.role}
            )
            return {
                "access_token": access_token,
                "user": user_data
            }
        return None

    @staticmethod
    def register(data):
        email = data.get("email")
        username = data.get("username")
        password = data.get("password")
        
        # Check if email or username exists
        if User.query.filter((User.email == email)).first():
            return {"error": "Email đã tồn tại"}
        if User.query.filter((User.username == username)).first():
            return {"error": "Tên đăng nhập đã tồn tại"}
            
        hashed_password = generate_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            full_name=data.get("full_name"),
            position=data.get("position"),
            department=data.get("department"),
            role="Cán bộ",
            status="Hoạt động"
        )
        db.session.add(new_user)
        db.session.commit()
        
        return AuthService.login(email, password)

    @staticmethod
    def request_reset(email):
        user = User.query.filter_by(email=email).first()
        if not user:
            return {"error": "Không tìm thấy người dùng với email này"}
            
        reset_token = str(uuid.uuid4())
        user.reset_token = reset_token
        user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=30)
        db.session.commit()
        
        return {"reset_token": reset_token}

    @staticmethod
    def reset_password(token, new_password):
        user = User.query.filter_by(reset_token=token).first()
        if not user:
            return {"error": "Token không hợp lệ"}
            
        if user.reset_token_expiry and user.reset_token_expiry < datetime.utcnow():
            return {"error": "Token đã hết hạn"}
            
        user.password_hash = generate_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        db.session.commit()
        
        return {"success": True}

    @staticmethod
    def get_user_info(identity):
        user = User.query.get(int(identity))
        if user:
            return {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "position": user.position,
                "department": user.department,
                "phone": user.phone,
                "full_name": user.full_name or user.username
            }
        return None

    @staticmethod
    def update_profile(identity, data):
        user = User.query.get(int(identity))
        if not user:
            return {"error": "Không tìm thấy người dùng"}
            
        if "full_name" in data:
            user.full_name = data["full_name"]
        if "phone" in data:
            user.phone = data["phone"]
        if "department" in data:
            user.department = data["department"]
        if "position" in data:
            user.position = data["position"]
            
        db.session.commit()
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "position": user.position,
                "department": user.department,
                "phone": user.phone,
                "full_name": user.full_name or user.username
            }
        }

    @staticmethod
    def change_password(identity, current_password, new_password):
        user = User.query.get(int(identity))
        if not user:
            return {"error": "Không tìm thấy người dùng"}
            
        try:
            is_valid = check_password_hash(user.password_hash, current_password)
        except ValueError:
            is_valid = (user.password_hash == current_password)
            
        if not is_valid:
            return {"error": "Mật khẩu hiện tại không chính xác"}
            
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        
        return {"success": True}
