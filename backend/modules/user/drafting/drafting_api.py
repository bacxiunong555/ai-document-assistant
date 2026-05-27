from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.modules.user.drafting.drafting_service import create_draft, VALID_DOC_TYPES
from backend.modules.user.drafting.template_service import TemplateService
from backend.core.exceptions import ValidationError, NotFoundError

drafting_bp = Blueprint("drafting", __name__, url_prefix="/api/drafting")

DOC_TYPE_LABELS = {
    "cong-van": "Công văn",
    "quyet-dinh": "Quyết định",
    "to-trinh": "Tờ trình",
    "bao-cao": "Báo cáo",
    "ke-hoach": "Kế hoạch",
    "thong-bao": "Thông báo",
    "bien-ban": "Biên bản",
}


@drafting_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate():
    import time
    start_time = time.time()
    try:
        data = request.get_json(force=True)
        user_id = int(get_jwt_identity())
        result = create_draft(data, user_id)
        
        response = {"success": True, "data": result}
        headers = {'X-Processing-Time': f"{time.time() - start_time:.2f}s"}
        return response, 200, headers
        
    except ValueError as e:
        return {"error": str(e)}, 422
    except ValidationError as e:
        return {"error": e.message}, 400
    except NotFoundError as e:
        return {"error": e.message}, 404
    except Exception as e:
        import traceback
        with open("error_log.txt", "w") as f:
            f.write(traceback.format_exc())
        return {"error": "Lỗi hệ thống"}, 500


@drafting_bp.route("/doc-types", methods=["GET"])
@jwt_required()
def get_doc_types():
    data = [{"value": k, "label": v} for k, v in DOC_TYPE_LABELS.items()]
    return {"data": data}, 200


@drafting_bp.route("/templates", methods=["GET"])
@jwt_required()
def get_templates():
    doc_type = request.args.get("doc_type")
    templates = TemplateService.get_all_templates()
    if doc_type:
        templates = [t for t in templates if t.doc_type == doc_type]
    data = [{"id": t.id, "name": t.name, "doc_type": t.doc_type} for t in templates]
    return {"data": data}, 200
