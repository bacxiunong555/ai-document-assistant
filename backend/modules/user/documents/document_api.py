# backend/modules/documents/document_api.py
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.modules.user.documents.document_service import DocumentService
from backend.core.response import success, error

document_bp = Blueprint("documents", __name__, url_prefix="/api/documents")

@document_bp.route("", methods=["GET"])
@jwt_required()
def get_documents():
    user_id = int(get_jwt_identity())
    docs = DocumentService.get_all_documents(user_id)
    return success(data=[{
        "id": d.id,
        "title": d.title,
        "doc_type": d.doc_type,
        "status": d.status,
        "created_at": d.created_at.isoformat()
    } for d in docs])

@document_bp.route("", methods=["POST"])
@jwt_required()
def create_document():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    try:
        doc = DocumentService.create_document(data, user_id)
        return success(data={"id": doc.id}, message="Tạo văn bản thành công")
    except Exception as e:
        return error(str(e))

@document_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_document(id):
    user_id = int(get_jwt_identity())
    try:
        doc = DocumentService.get_document_by_id(id, user_id)
        if doc is None:
            return error("Không tìm thấy văn bản", status=404)
        return success(data=doc)
    except PermissionError as pe:
        return error(str(pe), status=403)
    except Exception as e:
        return error(str(e), status=500)

@document_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_document(id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    try:
        doc = DocumentService.update_document(id, data, user_id)
        return success(message="Cập nhật thành công")
    except Exception as e:
        return error(str(e), status=404)

@document_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_document(id):
    user_id = int(get_jwt_identity())
    try:
        DocumentService.delete_document(id, user_id)
        return success(message="Xóa thành công")
    except Exception as e:
        return error(str(e), status=404)

@document_bp.route("/search", methods=["GET"])
@jwt_required()
def search_documents():
    user_id = int(get_jwt_identity())
    q = request.args.get("q", "")
    loai = request.args.get("loai", "")
    trang_thai = request.args.get("trang_thai", "")
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    
    data = DocumentService.search_documents(user_id, q, loai, trang_thai, page, limit)
    return success(data=data)

@document_bp.route("/filter-options", methods=["GET"])
@jwt_required()
def get_filter_options():
    user_id = int(get_jwt_identity())
    data = DocumentService.get_filter_options(user_id)
    return success(data=data)

