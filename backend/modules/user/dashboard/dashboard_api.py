from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.modules.user.dashboard.dashboard_service import get_stats, get_recent_documents, generate_ai_suggestions

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    user_id = get_jwt_identity()
    data = get_stats(user_id)
    return jsonify({"success": True, "data": data}), 200

@dashboard_bp.route("/recent-documents", methods=["GET"])
@jwt_required()
def recent_documents():
    user_id = get_jwt_identity()
    limit = request.args.get("limit", 5, type=int)
    data = get_recent_documents(user_id, limit)
    return jsonify({"success": True, "data": data}), 200

@dashboard_bp.route("/ai-suggestions", methods=["GET"])
@jwt_required()
def ai_suggestions():
    user_id = get_jwt_identity()
    data = generate_ai_suggestions(user_id)
    return jsonify({"success": True, "data": {"goi_y": data}}), 200
