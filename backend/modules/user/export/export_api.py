# backend/modules/export/export_api.py
from flask import Blueprint, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.core.response import success, error
from backend.modules.user.export.export_service import ExportService
import io

export_bp = Blueprint("export", __name__, url_prefix="/api/export")


@export_bp.route("/documents", methods=["GET"])
@jwt_required()
def get_exportable_documents():
    """Lấy danh sách văn bản có thể xuất."""
    user_id = int(get_jwt_identity())
    data = ExportService.get_exportable_documents(user_id)
    return success(data=data)


@export_bp.route("/download", methods=["POST"])
@jwt_required()
def download_documents():
    """Xuất và tải văn bản."""
    user_id = int(get_jwt_identity())
    body = request.get_json()
    doc_ids = body.get("doc_ids", [])
    fmt = body.get("format", "pdf")

    if not doc_ids:
        return error("Vui lòng chọn ít nhất một văn bản để xuất", 400)

    try:
        file_bytes, filename, mimetype = ExportService.export_documents(user_id, doc_ids, fmt)
        return send_file(
            io.BytesIO(file_bytes),
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename,
        )
    except Exception as e:
        return error(str(e), 500)
