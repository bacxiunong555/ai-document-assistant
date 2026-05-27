# backend/models/template.py
from datetime import datetime
from backend.extensions import db

class Template(db.Model):
    __tablename__ = "templates"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    doc_type = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
