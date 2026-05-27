import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { logout, getUser, updateProfile, changePassword } from "../app/auth";
import { useTheme } from "../hooks/useTheme";
import {
  LayoutDashboard, FileEdit, Search, Send, Download,
  Settings, Moon, Sun, LogOut, Bell, ChevronLeft, ChevronRight, User, Lock, X, Bot
} from "lucide-react";
import "./MainLayout.css";

const MainLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const user = getUser();
  const [userState, setUserState] = useState({
    full_name: user?.full_name || user?.username || 'Người dùng',
    email: user?.email || 'email@gov.vn',
    phone: user?.phone || '',
    role: user?.role === 'admin' ? 'Quản trị viên' : (user?.role || 'Cán bộ'),
    position: user?.position || 'Chuyên viên',
    department: user?.department || ''
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(userState.full_name);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [profileForm, setProfileForm] = useState(userState);
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  const handleOpenPassword = () => {
    setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    setShowPasswordModal(true);
    setShowProfileMenu(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const submitPasswordChange = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password) {
      alert("Vui lòng nhập đầy đủ thông tin mật khẩu!");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    try {
      const result = await changePassword(passwordForm.current_password, passwordForm.new_password);
      alert(result.message || "Đổi mật khẩu thành công!");
      setShowPasswordModal(false);
    } catch (error) {
      alert(error);
    }
  };

  const handleOpenProfile = () => {
    setProfileForm(userState);
    setShowProfileModal(true);
    setShowProfileMenu(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      const updatedUser = await updateProfile(profileForm);
      setUserState(prev => ({
        ...prev,
        ...updatedUser
      }));
      setShowProfileModal(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-icon"><Bot size={24} color="white" /></div>
          {isSidebarOpen && (
            <div className="logo-text">
              <h3>RAG Document</h3>
              <span>AI Assistant</span>
            </div>
          )}
        </div>

        <div className="nav-group">
          {isSidebarOpen && <span className="nav-label">CHỨC NĂNG CHÍNH</span>}
          <NavLink to="/" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <span className="icon" style={{ display: 'flex' }}><LayoutDashboard size={18} /></span>
            {isSidebarOpen && "Tổng quan"}
          </NavLink>
          <NavLink to="/drafting" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <span className="icon" style={{ display: 'flex' }}><FileEdit size={18} /></span>
            {isSidebarOpen && "Soạn thảo văn bản"}
          </NavLink>
          <NavLink to="/documents" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <span className="icon" style={{ display: 'flex' }}><Search size={18} /></span>
            {isSidebarOpen && "Tra cứu văn bản"}
          </NavLink>
          <NavLink to="/workflow" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <span className="icon" style={{ display: 'flex' }}><Send size={18} /></span>
            {isSidebarOpen && "Gửi duyệt & Theo dõi"}
          </NavLink>
          <NavLink to="/export" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <span className="icon" style={{ display: 'flex' }}><Download size={18} /></span>
            {isSidebarOpen && "Xuất văn bản"}
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <div className="nav-group" style={{ padding: '0 1rem', marginBottom: '8px' }}>
            <button className="nav-item">
              <span className="icon" style={{ display: 'flex' }}><Settings size={18} /></span>
              {isSidebarOpen && "Cài đặt"}
            </button>
            <button onClick={logout} className="nav-item logout-btn">
              <span className="icon" style={{ display: 'flex' }}><LogOut size={18} /></span>
              {isSidebarOpen && "Đăng xuất"}
            </button>
          </div>
          <button className="nav-item collapse-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <span className="icon" style={{ display: 'flex' }}>{isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</span>
            {isSidebarOpen && "Thu gọn"}
          </button>
        </div>
      </aside>

      <div className="main-container">
        <header className="header">
          <div className="header-left">
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Xin chào, {userState.full_name}</h2>
          </div>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="header-search" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary, #f1f5f9)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)', minWidth: '350px', marginRight: '0.5rem' }}>
              <Search size={18} style={{ color: 'var(--color-text-muted, #94a3b8)' }} />
              <input type="text" placeholder="Tìm kiếm văn bản, chức năng..." style={{ border: 'none', outline: 'none', background: 'transparent', marginLeft: '8px', width: '100%', color: 'var(--color-text, #1e293b)' }} />
            </div>
            <button onClick={toggleTheme} className="theme-toggle-header" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)' }}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="notification-bell" style={{ display: 'flex', position: 'relative', color: 'var(--color-text-muted)' }}>
              <Bell size={20} />
              <span className="badge">2</span>
            </div>
            <div className="user-profile-wrapper" style={{ position: 'relative' }}>
              <div
                className="user-avatar"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ cursor: 'pointer', color: 'white', backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' }}
              >
                {initials}
              </div>

              {showProfileMenu && (
                <>
                  <div className="profile-menu-overlay" onClick={() => setShowProfileMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }}></div>
                  <div className="profile-dropdown-menu" style={{ position: 'absolute', top: '120%', right: 0, background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', width: '240px', zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>{userState.full_name}</p>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{userState.email}</p>
                    </div>
                    <div style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <button onClick={handleOpenProfile} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '14px', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                        <User size={16} /> Thông tin cá nhân
                      </button>
                      <button onClick={handleOpenPassword} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '14px', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                        <Lock size={16} /> Đổi mật khẩu
                      </button>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      <button onClick={logout} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      {/* MODAL: Thông tin cá nhân */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Thông tin cá nhân</h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '24px', marginBottom: '12px', color: '#0ea5e9', backgroundColor: '#e0f2fe', borderColor: '#0ea5e9' }}>{initials}</div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>{profileForm.full_name || 'Người dùng'}</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{profileForm.email}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Họ và tên</label>
                  <input type="text" name="full_name" value={profileForm.full_name} onChange={handleProfileChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', boxSizing: 'border-box' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Email</label>
                  <input type="email" value={profileForm.email} readOnly style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box' }} />
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Email không thể thay đổi</p>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Số điện thoại</label>
                  <input type="text" name="phone" value={profileForm.phone} onChange={handleProfileChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', boxSizing: 'border-box' }} />
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Chức vụ</label>
                    <input type="text" name="position" value={profileForm.position} onChange={handleProfileChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', boxSizing: 'border-box' }} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Phòng ban</label>
                    <input type="text" name="department" value={profileForm.department} onChange={handleProfileChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#1e293b', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
              <button onClick={saveProfile} style={{ flex: 1, padding: '10px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FileEdit size={16} /> Lưu thay đổi</button>
              <button onClick={() => setShowProfileModal(false)} style={{ flex: 1, padding: '10px', background: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Đổi mật khẩu */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0ea5e9' }}><Lock size={20} /> Đổi mật khẩu</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Mật khẩu hiện tại</label>
                <input type="password" name="current_password" value={passwordForm.current_password} onChange={handlePasswordChange} placeholder="Nhập mật khẩu hiện tại" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #0ea5e9', boxSizing: 'border-box' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Mật khẩu mới</label>
                <input type="password" name="new_password" value={passwordForm.new_password} onChange={handlePasswordChange} placeholder="Nhập mật khẩu mới" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>Xác nhận mật khẩu</label>
                <input type="password" name="confirm_password" value={passwordForm.confirm_password} onChange={handlePasswordChange} placeholder="Nhập lại mật khẩu mới" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', gap: '12px' }}>
              <button onClick={submitPasswordChange} style={{ flex: 1, padding: '10px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>Đổi mật khẩu</button>
              <button onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: '10px', background: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
