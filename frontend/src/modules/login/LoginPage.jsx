import React, { useState } from "react";
import { Check } from "lucide-react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import "./Login.css";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="login-page-wrapper">
      {/* LEFT PANEL */}
      <div className="login-left-panel">
        <div className="login-left-overlay"></div>
        <div className="login-left-content">
          <h1>Soạn thảo văn bản<br/>hành chính bằng AI</h1>
          <p>Tăng hiệu suất công việc, giảm sai sót với hỗ trợ của trí tuệ nhân tạo</p>

          <div className="login-features">
            <div className="feature-item">
              <Check size={20} color="#10b981" />
              <span>Soạn thảo nhanh chóng và chính xác</span>
            </div>
            <div className="feature-item">
              <Check size={20} color="#10b981" />
              <span>Tuân thủ quy định hành chính</span>
            </div>
            <div className="feature-item">
              <Check size={20} color="#10b981" />
              <span>Bảo mật thông tin tối đa</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right-panel">
        <div className="login-header-text">
          <h2>
            {activeTab === "login" && "Đăng nhập"}
            {activeTab === "register" && "Đăng kí tài khoản"}
            {activeTab === "forgot" && "Quên mật khẩu"}
          </h2>
          <p>Hệ thống quản lý văn bản hành chính</p>
        </div>

        <div className="login-card">
          {activeTab === "login" && <LoginForm setActiveTab={setActiveTab} />}
          {activeTab === "register" && <RegisterForm setActiveTab={setActiveTab} />}
          {activeTab === "forgot" && <ForgotPasswordForm setActiveTab={setActiveTab} />}
        </div>

        <div className="copyright-footer">
          © 2026 Hệ thống quản lý văn bản hành chính. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
