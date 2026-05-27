import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboard } from '../../../../hooks/useDashboard';
import { 
  FileText, Clock, CircleCheck, CircleX, ArrowRight, 
  Calendar, Sparkles, FilePlus, BarChart, Plus, Search 
} from 'lucide-react';
import './Dashboard.css';

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'da_duyet': return <span className="status-badge badge-da_duyet">Đã duyệt</span>;
    case 'cho_duyet': return <span className="status-badge badge-cho_duyet">Chờ duyệt</span>;
    case 'yeu_cau_sua': return <span className="status-badge badge-yeu_cau_sua">Yêu cầu sửa</span>;
    case 'ban_nhap': return <span className="status-badge badge-ban_nhap">Bản nháp</span>;
    default: return <span className="status-badge badge-ban_nhap">{status}</span>;
  }
};

export default function DashboardPage() {
  const { stats, recentDocuments, aiSuggestions, loading, error, fetchAiSuggestions } = useDashboard();
  const navigate = useNavigate();

  if (error) {
    return <div className="dashboard-container"><div className="empty-state">{error}</div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tổng quan</h1>
        <p>Tổng quan hoạt động và thống kê văn bản</p>
      </div>

      {/* SECTION 1: Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-title">Tổng văn bản đã soạn</p>
            <h2 className="stat-value">{loading.stats ? '...' : formatNumber(stats?.tong_van_ban)}</h2>
            <p className="stat-sub">{loading.stats ? '' : `+${stats?.phan_tram_tang}% so với tháng trước`}</p>
          </div>
          <div className="stat-icon icon-blue" style={{background: 'transparent', padding: 0}}><FileText size={32} color="#3b82f6" /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-title">Đang chờ duyệt</p>
            <h2 className="stat-value">{loading.stats ? '...' : formatNumber(stats?.cho_duyet)}</h2>
            <p className="stat-sub">{loading.stats ? '' : `${stats?.van_ban_khan} văn bản khẩn`}</p>
          </div>
          <div className="stat-icon icon-orange" style={{background: 'transparent', padding: 0}}><Clock size={32} color="#f59e0b" /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-title">Đã được phê duyệt</p>
            <h2 className="stat-value">{loading.stats ? '...' : formatNumber(stats?.da_duyet)}</h2>
            <p className="stat-sub">Trong tháng này</p>
          </div>
          <div className="stat-icon icon-green" style={{background: 'transparent', padding: 0}}><CircleCheck size={32} color="#10b981" /></div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-title">Bị từ chối / Yêu cầu sửa</p>
            <h2 className="stat-value">{loading.stats ? '...' : formatNumber(stats?.bi_tu_choi)}</h2>
            <p className="stat-sub">Cần xử lý ngay</p>
          </div>
          <div className="stat-icon icon-red" style={{background: 'transparent', padding: 0}}><CircleX size={32} color="#ef4444" /></div>
        </div>
      </div>

      {/* SECTION 2: Main Content */}
      <div className="main-grid">
        {/* Left Column: Recent Documents */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">Văn bản gần đây</h3>
            <Link to="/documents" className="view-all-link" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              Xem tất cả <ArrowRight size={16} color="#3b82f6" />
            </Link>
          </div>
          <div className="doc-list">
            {loading.documents ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="doc-item skeleton" style={{ height: '72px' }}></div>
              ))
            ) : recentDocuments.length > 0 ? (
              recentDocuments.map(doc => (
                <Link to={`/documents/${doc.id}`} key={doc.id} className="doc-item">
                  <div className="doc-icon" style={{background: 'transparent', padding: 0}}><FileText size={16} color="#6b7280" /></div>
                  <div className="doc-info">
                    <p className="doc-title">{doc.tieu_de}</p>
                    <p className="doc-meta">{doc.loai_van_ban} • {doc.so_hieu}</p>
                  </div>
                  <div className="doc-right">
                    <span className="doc-date" style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Calendar size={14} color="#9ca3af" /> {doc.ngay_tao}</span>
                    {getStatusBadge(doc.trang_thai)}
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">Chưa có văn bản nào.</div>
            )}
          </div>
        </div>

        {/* Right Column: AI Suggestions */}
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title" style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#f59e0b" /> Gợi ý từ AI
            </h3>
          </div>
          <div className="ai-list">
            {loading.suggestions ? (
              <div className="spinner-small"></div>
            ) : aiSuggestions.length > 0 ? (
              <>
                {aiSuggestions.map((sug, i) => (
                  <div key={i} className="ai-item">{sug}</div>
                ))}
                <button className="ai-more-btn" onClick={fetchAiSuggestions}>Xem thêm gợi ý</button>
              </>
            ) : (
              <div className="empty-state">Không có gợi ý nào.</div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: Quick Actions */}
      <div className="section-card" style={{ minHeight: 'auto' }}>
        <div className="section-header">
          <h3 className="section-title">Thao tác nhanh</h3>
        </div>
        <div className="quick-actions-grid">
          <Link to="/drafting" className="action-btn">
            <div className="action-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9' }}><FilePlus size={24} color="#0ea5e9" /></div>
            <div className="action-content">
              <span className="action-name">Soạn văn bản mới</span>
              <span className="action-desc">Tạo và chỉnh sửa bằng AI</span>
            </div>
            <span className="action-arrow"><ArrowRight size={16} color="#9ca3af" /></span>
          </Link>
          <Link to="/documents?status=cho_duyet" className="action-btn">
            <div className="action-icon-wrapper" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}><Clock size={24} color="#f97316" /></div>
            <div className="action-content">
              <span className="action-name">Văn bản chờ duyệt</span>
              <span className="action-desc">Xử lý văn bản trình ký</span>
            </div>
            <span className="action-arrow"><ArrowRight size={16} color="#9ca3af" /></span>
          </Link>
          <Link to="/documents?status=da_duyet" className="action-btn">
            <div className="action-icon-wrapper" style={{ backgroundColor: '#dcfce3', color: '#22c55e' }}><CircleCheck size={24} color="#22c55e" /></div>
            <div className="action-content">
              <span className="action-name">Văn bản đã duyệt</span>
              <span className="action-desc">Xem kho văn bản hoàn tất</span>
            </div>
            <span className="action-arrow"><ArrowRight size={16} color="#9ca3af" /></span>
          </Link>
          <Link to="/reports" className="action-btn">
            <div className="action-icon-wrapper" style={{ backgroundColor: '#f3f4f6', color: '#64748b' }}><BarChart size={24} color="#64748b" /></div>
            <div className="action-content">
              <span className="action-name">Báo cáo thống kê</span>
              <span className="action-desc">Xem biểu đồ số liệu</span>
            </div>
            <span className="action-arrow"><ArrowRight size={16} color="#9ca3af" /></span>
          </Link>
        </div>
      </div>

      <button className="fab-btn" style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#0f766e',
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(15, 118, 110, 0.4)',
        cursor: 'pointer',
        zIndex: 1000
      }}>
        <Plus size={24} color="white" />
      </button>
    </div>
  );
}
