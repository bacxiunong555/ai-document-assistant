from flask import Blueprint, jsonify, request
import time

admin_users_bp = Blueprint("admin_users", __name__, url_prefix="/api/admin")

@admin_users_bp.route("/user-stats", methods=["GET"])
def get_user_stats():
    from backend.models.user import User
    total = User.query.count()
    active = User.query.filter_by(status="Hoạt động").count()
    inactive = User.query.filter_by(status="Không hoạt động").count()
    locked = User.query.filter_by(status="Đã khóa").count()
    return jsonify({
        "success": True,
        "data": {
            "totalUsers": total,
            "activeUsers": active,
            "inactiveUsers": inactive,
            "lockedUsers": locked
        }
    })

@admin_users_bp.route("/users", methods=["GET", "POST"])
def manage_users():
    from backend.models.user import User
    from backend.models.document import Document
    from backend.extensions import db
    
    if request.method == "POST":
        data = request.json
        email = data.get("email", "")
        username = email.split("@")[0] if email else f"user_{int(time.time())}"
        
        new_user = User(
            username=username,
            email=email,
            full_name=data.get("fullName"),
            role=data.get("role"),
            department=data.get("department"),
            status="Hoạt động",
            password_hash="123456" # Mật khẩu mặc định
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"success": True, "message": "Đã thêm người dùng. Mật khẩu mặc định: 123456"})
        
    users = User.query.order_by(User.id.desc()).all()
    data = []
    for u in users:
        docs_count = Document.query.filter_by(author_id=u.id).count()
        data.append({
            "id": u.id,
            "fullName": u.full_name or u.username,
            "email": u.email or f"{u.username}@example.com",
            "department": u.department or "Chưa phân bổ",
            "role": u.role,
            "status": u.status,
            "lastLogin": u.last_login.strftime("%Y-%m-%d %H:%M") if u.last_login else "Chưa đăng nhập",
            "docsCount": docs_count
        })
    return jsonify({"success": True, "data": data})

@admin_users_bp.route("/users/<int:user_id>", methods=["PUT", "DELETE"])
def manage_single_user(user_id):
    from backend.models.user import User
    from backend.extensions import db
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "Không tìm thấy người dùng"}), 404
        
    if request.method == "DELETE":
        db.session.delete(user)
        db.session.commit()
        return jsonify({"success": True, "message": "Xóa người dùng thành công"})
        
    if request.method == "PUT":
        data = request.json
        user.full_name = data.get("fullName", user.full_name)
        user.email = data.get("email", user.email)
        user.role = data.get("role", user.role)
        user.department = data.get("department", user.department)
        
        # update username from email if email is provided
        if "email" in data and data["email"]:
            user.username = data["email"].split("@")[0]
            
        db.session.commit()
        return jsonify({"success": True, "message": "Cập nhật thông tin người dùng thành công"})
