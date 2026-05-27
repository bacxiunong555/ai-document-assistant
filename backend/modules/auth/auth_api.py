# backend/modules/auth/auth_api.py
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.modules.auth.auth_service import AuthService
from backend.core.response import success, error

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return error("Thiếu email hoặc mật khẩu")
        
    result = AuthService.login(email, password)
    if result:
        return success(data=result, message="Đăng nhập thành công")
    
    return error("Email hoặc mật khẩu không chính xác", status=401)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    
    if not data.get("email") or not data.get("password") or not data.get("username") or not data.get("full_name"):
        return error("Vui lòng điền đầy đủ thông tin bắt buộc")
        
    if len(data.get("password")) < 6:
        return error("Mật khẩu phải dài ít nhất 6 ký tự")
        
    result = AuthService.register(data)
    
    if "error" in result:
        return error(result["error"])
        
    return success(data=result, message="Đăng ký thành công")

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    
    if not email:
        return error("Thiếu email")
        
    result = AuthService.request_reset(email)
    
    if "error" in result:
        return error(result["error"])
        
    return success(data=result, message="Đã gửi token đặt lại mật khẩu")

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("password")
    
    if not token or not new_password:
        return error("Thiếu token hoặc mật khẩu mới")
        
    result = AuthService.reset_password(token, new_password)
    
    if "error" in result:
        return error(result["error"])
        
    return success(message="Đặt lại mật khẩu thành công")

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    identity = get_jwt_identity()
    user_info = AuthService.get_user_info(identity)
    if user_info:
        return success(data=user_info)
    return error("Không tìm thấy người dùng", status=404)

@auth_bp.route("/update-profile", methods=["PUT"])
@jwt_required()
def update_profile():
    identity = get_jwt_identity()
    data = request.get_json()
    
    result = AuthService.update_profile(identity, data)
    
    if "error" in result:
        return error(result["error"])
        
    return success(data=result["user"], message="Cập nhật thông tin thành công")

@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    identity = get_jwt_identity()
    data = request.get_json()
    
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        return error("Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới")
        
    if len(new_password) < 6:
        return error("Mật khẩu mới phải dài ít nhất 6 ký tự")
        
    result = AuthService.change_password(identity, current_password, new_password)
    
    if "error" in result:
        return error(result["error"], status=400)
        
    return success(message="Đổi mật khẩu thành công")
