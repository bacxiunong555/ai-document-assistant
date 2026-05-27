from flask import Blueprint, jsonify

admin_dashboard_bp = Blueprint("admin_dashboard", __name__, url_prefix="/api/admin")

@admin_dashboard_bp.route("/stats", methods=["GET"])
def get_stats():
    from backend.models.rag_document import RagDocument
    from backend.models.user import User
    from backend.models.document import Document
    
    rag_docs = RagDocument.query.count()
    users = User.query.count()
    processed_docs = Document.query.count()
    
    return jsonify({
        "success": True,
        "data": {
            "ragDocs": rag_docs,
            "users": users,
            "processedDocs": processed_docs,
            "aiQueries": 1234 # Mocked for now since there's no log table
        }
    })

@admin_dashboard_bp.route("/rag-categories", methods=["GET"])
def get_rag_categories():
    return jsonify({
        "success": True,
        "data": [
            {"label": "Công văn", "count": 845, "percentage": 30},
            {"label": "Quyết định", "count": 623, "percentage": 22},
            {"label": "Nghị định", "count": 412, "percentage": 14},
            {"label": "Thông tư", "count": 356, "percentage": 13},
            {"label": "Báo cáo", "count": 298, "percentage": 10},
            {"label": "Khác", "count": 313, "percentage": 11}
        ]
    })

@admin_dashboard_bp.route("/recent-activities", methods=["GET"])
def get_recent_activities():
    return jsonify({
        "success": True,
        "data": [
            {"id": 1, "action": "Upload tài liệu", "user": "Nguyễn Minh Anh", "target": "50 văn bản pháp luật", "time": "5 phút trước", "status": "success"},
            {"id": 2, "action": "Thêm người dùng", "user": "Admin", "target": "Trần Thị B - Chuyên viên", "time": "15 phút trước", "status": "success"},
            {"id": 3, "action": "Đăng nhập thất bại", "user": "Unknown", "target": "IP: 192.168.1.100", "time": "30 phút trước", "status": "error"}
        ]
    })
