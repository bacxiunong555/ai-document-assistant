# backend/modules/drafting/template_api.py
from flask import Blueprint
from flask_jwt_extended import jwt_required
from backend.modules.user.drafting.template_service import TemplateService
from backend.core.response import success, error

template_bp = Blueprint("templates", __name__, url_prefix="/api/templates")

@template_bp.route("", methods=["GET"])
@jwt_required()
def get_templates():
    templates = TemplateService.get_all_templates()
    return success(data=[{
        "id": t.id,
        "name": t.name,
        "doc_type": t.doc_type
    } for t in templates])

@template_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_template(id):
    t = TemplateService.get_template_by_id(id)
    if t:
        return success(data={
            "id": t.id,
            "name": t.name,
            "doc_type": t.doc_type,
            "content": t.content
        })
    return error("Không tìm thấy mẫu văn bản", status=404)
