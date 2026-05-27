# backend/models/workflow.py
from datetime import datetime
from backend.extensions import db


class WorkflowStep(db.Model):
    """Mỗi bước trong quy trình phê duyệt."""
    __tablename__ = "workflow_steps"

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey("documents.id"), nullable=False)
    step_order = db.Column(db.Integer, nullable=False)           # 1, 2, 3...
    total_steps = db.Column(db.Integer, default=3)
    approver_name = db.Column(db.String(100), nullable=False)    # Tên người duyệt
    approver_role = db.Column(db.String(100), nullable=False)    # Chức vụ
    status = db.Column(db.String(20), default="cho_duyet")       # cho_duyet | da_duyet | tu_choi
    note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    document = db.relationship("Document", backref=db.backref("workflow_steps", lazy=True))
