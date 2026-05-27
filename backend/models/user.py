# backend/models/user.py
from datetime import datetime
from backend.extensions import db

class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="Cán bộ")
    position = db.Column(db.String(100), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), default="Hoạt động") # Hoạt động, Không hoạt động, Đã khóa
    full_name = db.Column(db.String(100))
    phone = db.Column(db.String(20), nullable=True)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
