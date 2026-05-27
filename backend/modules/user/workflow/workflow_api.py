# backend/modules/workflow/workflow_api.py
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.core.response import success, error
from backend.modules.user.workflow.workflow_service import WorkflowService

workflow_bp = Blueprint("workflow", __name__, url_prefix="/api/workflow")


@workflow_bp.route("/documents", methods=["GET"])
@jwt_required()
def get_workflow_documents():
    """Lấy danh sách văn bản theo tab."""
    user_id = int(get_jwt_identity())
    tab = request.args.get("tab", "cho_duyet")
    data = WorkflowService.get_workflow_documents(user_id, tab)
    return success(data=data)


@workflow_bp.route("/counts", methods=["GET"])
@jwt_required()
def get_tab_counts():
    """Đếm số văn bản mỗi tab."""
    user_id = int(get_jwt_identity())
    data = WorkflowService.get_tab_counts(user_id)
    return success(data=data)


@workflow_bp.route("/detail/<int:doc_id>", methods=["GET"])
@jwt_required()
def get_approval_detail(doc_id):
    """Lấy chi tiết quy trình phê duyệt."""
    user_id = int(get_jwt_identity())
    try:
        data = WorkflowService.get_approval_detail(user_id, doc_id)
        return success(data=data)
    except Exception as e:
        return error(str(e), 404)


@workflow_bp.route("/submit/<int:doc_id>", methods=["POST"])
@jwt_required()
def submit_for_approval(doc_id):
    """Gửi văn bản đi duyệt."""
    user_id = int(get_jwt_identity())
    try:
        WorkflowService.submit_for_approval(user_id, doc_id)
        return success(message="Đã gửi văn bản đi duyệt")
    except Exception as e:
        return error(str(e), 400)
