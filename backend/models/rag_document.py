# backend/models/rag_document.py
from datetime import datetime
from backend.extensions import db

class RagDocument(db.Model):
    __tablename__ = "rag_documents"
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(20)) # pdf, docx
    category = db.Column(db.String(50)) # cong-van, quyet-dinh...
    status = db.Column(db.String(50), default="Đang xử lý") # Đang xử lý, Đã index, Lỗi
    chunk_count = db.Column(db.Integer, default=0)
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
