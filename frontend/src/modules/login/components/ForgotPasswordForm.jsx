import React, { useState } from "react";
import { requestPasswordReset } from "../../../app/auth";
import { Mail } from "lucide-react";

const ForgotPasswordForm = ({ setActiveTab }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await requestPasswordReset(email);
      setSuccess(`Mã khôi phục: ${res.reset_token} (Demo)`);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-card-header">
        <h3>Khôi phục</h3>
        <p>Nhập email để nhận mã khôi phục</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <div className="login-form-group">
          <label><Mail size={16} /> Email</label>
          <div className="input-wrapper">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          <Mail size={18} />
          {loading ? "Đang xử lý..." : "Gửi mã khôi phục"}
        </button>
      </form>

      <div className="login-footer-link">
        Đã có tài khoản? 
        <button onClick={() => setActiveTab("login")}>Đăng nhập</button>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
