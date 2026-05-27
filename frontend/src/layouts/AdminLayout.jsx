import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../app/auth';
import {
  LayoutDashboard, Database, Upload, Users, Activity,
  Settings, LogOut, ChevronLeft, ChevronRight,
  Search, RefreshCw, Terminal, Moon, Bell
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6V12C3 17.5 7 22 12 22C17 22 21 17.5 21 12V6L12 2Z" fill="#10b981"/>
            </svg>
          </div>
          {isSidebarOpen && (
            <div className="admin-logo-text">
              <h2>Admin Panel</h2>
              <span>Quản trị hệ thống</span>
            </div>
          )}
        </div>
        
        <nav className="admin-nav">
          {/* QUẢN LÝ */}
          <div className="nav-section">
            {isSidebarOpen && <div className="nav-section-title">QUẢN LÝ</div>}
            <NavLink to="/admin/overview" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
              <span className="admin-icon"><LayoutDashboard size={18} /></span>
              {isSidebarOpen && <span className="admin-text">Tổng quan</span>}
            </NavLink>
            <NavLink to="/admin/rag-documents" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
              <span className="admin-icon"><Database size={18} /></span>
              {isSidebarOpen && <span className="admin-text">Kho tài liệu RAG</span>}
            </NavLink>
            <NavLink to="/admin/upload" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
              <span className="admin-icon"><Upload size={18} /></span>
              {isSidebarOpen && <span className="admin-text">Upload tài liệu</span>}
            </NavLink>
            <NavLink to="/admin/users" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
              <span className="admin-icon"><Users size={18} /></span>
              {isSidebarOpen && <span className="admin-text">Quản lý người dùng</span>}
            </NavLink>
            <NavLink to="/admin/system" className={({isActive}) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
              <span className="admin-icon"><Activity size={18} /></span>
              {isSidebarOpen && <span className="admin-text">Giám sát hệ thống</span>}
            </NavLink>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="nav-section" style={{padding: '0 12px', marginBottom: '8px'}}>
            <button className="admin-nav-item">
              <span className="admin-icon"><Settings size={18} /></span>
              {isSidebarOpen && <span className="admin-text">Cài đặt</span>}
            </button>
            <button className="admin-nav-item logout-btn" onClick={logout} style={{color: '#f87171'}}>
              <span className="admin-icon"><LogOut size={18} /></span>
              {isSidebarOpen && <span className="admin-text">Đăng xuất</span>}
            </button>
          </div>
          <button className="admin-nav-item collapse-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <span className="admin-icon">{isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</span>
            {isSidebarOpen && <span className="admin-text">Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
             <div className="topbar-titles">
               <h1>Quản trị hệ thống</h1>
               <p>RAG Document AI - Admin Panel</p>
             </div>
          </div>
          
          <div className="topbar-right">
            <div className="search-box">
              <span className="admin-search-icon"><Search size={16} color="#9ca3af" /></span>
              <input type="text" placeholder="Tìm kiếm..." />
            </div>
            
            <div className="system-badge">
              <span className="dot"></span>
              Hệ thống hoạt động
            </div>
            
            <div className="topbar-icons">
              <button className="icon-btn"><RefreshCw size={18} /></button>
              <button className="icon-btn"><Terminal size={18} /></button>
              <button className="icon-btn"><Moon size={18} /></button>
              <button className="icon-btn bell-btn" style={{ position: 'relative' }}>
                <Bell size={18} />
                <span className="bell-badge">2</span>
              </button>
            </div>
            
            <div className="avatar">AD</div>
          </div>
        </header>
        
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
