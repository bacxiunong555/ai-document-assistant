import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../../app/auth";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

const LoginForm = ({ setActiveTab }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const authData = await login(formData.email, formData.password);
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
        <h3>Đăng nhập</h3>
        <p>Hệ thống quản lý văn bản hành chính</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}

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
          <button type="button" className="forgot-pw-link" onClick={() => setActiveTab("forgot")}>
            Quên mật khẩu?
          </button>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          <LogIn size={18} />
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="login-footer-link">
        Chưa có tài khoản? 
        <button onClick={() => setActiveTab("register")}>Đăng kí ngay</button>
      </div>
    </>
  );
};

export default LoginForm;
