import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../../app/auth";
import { User, Building2, Mail, Lock, KeyRound, Eye, EyeOff, UserPlus } from "lucide-react";

const RegisterForm = ({ setActiveTab }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }
    
    try {
      const registerData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.fullName
      };
      
      const authData = await register(registerData);
      navigate(authData?.user?.role === "Admin" ? "/admin" : "/");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-card-header">
        <h3>Đăng kí</h3>
        <p>Tạo tài khoản mới để sử dụng hệ thống</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}

        <div className="login-form-group">
          <label><User size={16} /> Họ và tên</label>
          <div className="input-wrapper">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>
        </div>

        <div className="login-form-group">
          <label><Building2 size={16} /> Tên đăng nhập</label>
          <div className="input-wrapper">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="nguyenvana"
              required
            />
          </div>
        </div>

        <div className="login-form-group">
          <label><Mail size={16} /> Email</label>
          <div className="input-wrapper">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@example.com"
              required
            />
          </div>
        </div>

        <div className="login-form-group">
          <label><Lock size={16} /> Mật khẩu</label>
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
            />
            <div 
              className="input-icon-right" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>

        <div className="login-form-group">
          <label><KeyRound size={16} /> Nhập lại mật khẩu</label>
          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
            />
            <div 
              className="input-icon-right" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>

        <button type="submit" className="btn-submit dark" disabled={loading}>
          <UserPlus size={18} />
          {loading ? "Đang xử lý..." : "Đăng kí"}
        </button>
      </form>

      <div className="login-footer-link">
        Đã có tài khoản? 
        <button onClick={() => setActiveTab("login")}>Đăng nhập</button>
      </div>
    </>
  );
};

export default RegisterForm;
