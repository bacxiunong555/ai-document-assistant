import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/admin.service';
import { 
  Database, CircleCheck, Clock, TriangleAlert, FileStack, RefreshCw, FilePlus, 
  Search, FileText, MoreHorizontal, Eye, Download, Edit2, Trash2
} from 'lucide-react';
import './RAGDocuments.css';

const RAGDocuments = () => {
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isReindexing, setIsReindexing] = useState(false);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        adminService.getRagDocuments(),
        adminService.getRagStats()
      ]);
      setDocs(docsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu RAG:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      try {
        await adminService.deleteRagDocument(id);
        alert("Xóa thành công!");
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa tài liệu");
      }
    }
    setOpenDropdownId(null);
  };

  const handleReindexAll = async () => {
    if (!window.confirm("Re-index sẽ xóa collection Chroma hiện tại và nạp lại toàn bộ tài liệu trong backend/data/raw. Tiếp tục?")) {
      return;
    }

    setIsReindexing(true);
    try {
      const res = await adminService.reindexRagDocuments();
      const data = res.data?.data;
      const rawCount = data?.raw_file_count ?? 'N/A';
      const supportedCount = data?.supported_file_count ?? 'N/A';
      alert(`Re-index hoàn tất: raw ${rawCount} file, hỗ trợ ${supportedCount} file, đã index ${data?.indexed_files || 0} file, ${data?.total_chunks || 0} chunks, Chroma: ${data?.chroma_count ?? 'N/A'}, Disk: ${data?.disk_count ?? 'N/A'}`);
      fetchData();
    } catch (error) {
      alert("Lỗi khi re-index tài liệu");
    } finally {
      setIsReindexing(false);
    }
  };

  const filteredDocs = docs.filter(doc => {
    if (searchTerm && !doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter && doc.category !== categoryFilter) return false;
    if (statusFilter && doc.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const currentDocs = filteredDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="rag-documents-container">
      {/* Page Header */}
      <div className="rag-page-header">
        <h2>Kho tài liệu RAG</h2>
      </div>

      {/* 5 Stat cards */}
      {stats && (
        <div className="rag-stats-row">
          <div className="rag-stat-box">
            <div className="stat-icon-wrapper bg-blue-100 text-blue-600" style={{background: 'transparent', padding: 0}}>
              <span className="stat-icon"><Database size={24} color="#3b82f6" /></span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalDocs}</span>
              <span className="stat-label">Tổng tài liệu</span>
            </div>
          </div>
          <div className="rag-stat-box">
            <div className="stat-icon-wrapper bg-green-100 text-green-600" style={{background: 'transparent', padding: 0}}>
              <span className="stat-icon"><CircleCheck size={24} color="#10b981" /></span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.indexedDocs}</span>
              <span className="stat-label">Đã index</span>
            </div>
          </div>
          <div className="rag-stat-box">
            <div className="stat-icon-wrapper bg-orange-100 text-orange-600" style={{background: 'transparent', padding: 0}}>
              <span className="stat-icon"><Clock size={24} color="#f59e0b" /></span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.processingDocs}</span>
              <span className="stat-label">Đang xử lý</span>
            </div>
          </div>
          <div className="rag-stat-box">
            <div className="stat-icon-wrapper bg-red-100 text-red-600" style={{background: 'transparent', padding: 0}}>
              <span className="stat-icon"><TriangleAlert size={24} color="#ef4444" /></span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.errorDocs}</span>
              <span className="stat-label">Lỗi</span>
            </div>
          </div>
          <div className="rag-stat-box">
            <div className="stat-icon-wrapper bg-purple-100 text-purple-600" style={{background: 'transparent', padding: 0}}>
              <span className="stat-icon"><FileStack size={24} color="#8b5cf6" /></span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalChunks}</span>
              <span className="stat-label">Tổng chunks</span>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="rag-table-card">
        <div className="rag-table-header">
          <h2>Danh sách tài liệu RAG</h2>
          <div className="rag-header-actions">
            <button className="rag-btn-outline" onClick={handleReindexAll} disabled={isReindexing}>
              <span className="icon-mr"><RefreshCw size={16} className={isReindexing ? 'spin' : ''} /></span>
              {isReindexing ? 'Đang re-index...' : 'Re-index All'}
            </button>
            <button className="rag-btn-primary" onClick={() => navigate('/admin/upload')}>
              <span className="icon-mr"><FilePlus size={16} color="white" /></span> Thêm tài liệu
            </button>
          </div>
        </div>

        <div className="rag-table-filters">
          <div className="search-wrapper full-width">
            <span className="admin-search-icon"><Search size={16} color="#9ca3af" /></span>
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu..." 
              className="filter-input-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdowns">
            <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Tất cả loại</option>
              <option value="general">Tổng hợp</option>
              <option value="nghi-quyet">Nghị quyết</option>
              <option value="quyet-dinh">Quyết định</option>
              <option value="van-ban-co-ten-loai">Văn bản có tên loại</option>
              <option value="cong-van">Công văn</option>
              <option value="cong-dien">Công điện</option>
              <option value="giay-moi">Giấy mời</option>
              <option value="giay-gioi-thieu">Giấy giới thiệu</option>
              <option value="bien-ban">Biên bản</option>
              <option value="giay-nghi-phep">Giấy nghỉ phép</option>
              <option value="to-trinh">Tờ trình</option>
              <option value="bao-cao">Báo cáo</option>
              <option value="ke-hoach">Kế hoạch</option>
              <option value="thong-bao">Thông báo</option>
            </select>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="Đã index">Đã index</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Lỗi">Lỗi</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên tài liệu</th>
                <th>Loại</th>
                <th>Danh mục</th>
                <th>Ngày upload</th>
                <th>Trạng thái</th>
                <th>Chunks</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Đang tải...</td></tr>
              ) : currentDocs.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Không có dữ liệu</td></tr>
              ) : (
                currentDocs.map(doc => (
                  <tr key={doc.id}>
                    <td className="doc-name-col">
                      <div className="doc-icon-box" style={{background: 'transparent', padding: 0, border: 'none'}}>
                        <span className="doc-icon"><FileText size={16} color="#3b82f6" /></span>
                      </div>
                      <span className="font-medium text-dark">{doc.filename}</span>
                    </td>
                    <td><span className="badge-type">{doc.fileType.charAt(0).toUpperCase() + doc.fileType.slice(1).toLowerCase()}</span></td>
                    <td>{doc.category || "Hành chính"}</td>
                    <td>{doc.createdAt.split(' ')[0]}</td>
                    <td>
                      <div className={`status-badge-styled ${
                        doc.status === 'Đã index' ? 'success' : 
                        doc.status === 'Đang xử lý' ? 'processing' : 'error'
                      }`}>
                        <span className="status-icon" style={{marginRight: '6px', display: 'flex'}}>
                          {doc.status === 'Đã index' ? <CircleCheck size={14} color="#10b981" /> : doc.status === 'Đang xử lý' ? <Clock size={14} color="#f59e0b" /> : <TriangleAlert size={14} color="#ef4444" />}
                        </span>
                        {doc.status}
                      </div>
                    </td>
                    <td>{doc.chunkCount}</td>
                    <td>
                      <div className="action-dropdown-wrapper" style={{ position: 'relative' }}>
                         <button 
                           className="icon-btn-more" 
                           onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === doc.id ? null : doc.id); }}
                           style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px'}}
                         >
                           <MoreHorizontal size={18} color="#6b7280" />
                         </button>
                         {openDropdownId === doc.id && (
                           <div className="action-dropdown-menu" style={{ position: 'absolute', right: '0', top: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 10 }}>
                             <div className="action-item" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#059669', fontWeight: '500' }}>
                               <Eye size={16} /> Xem chi tiết
                             </div>
                             <div className="action-item" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#4b5563' }}>
                               <RefreshCw size={16} /> Re-index
                             </div>
                             <div className="action-item" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#4b5563' }}>
                               <Download size={16} /> Tải xuống
                             </div>
                             <div className="action-item" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#4b5563' }}>
                               <Edit2 size={16} /> Chỉnh sửa
                             </div>
                             <div className="action-item" onClick={() => handleDeleteDoc(doc.id)} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ef4444' }}>
                               <Trash2 size={16} /> Xóa
                             </div>
                           </div>
                         )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="page-info">Hiển thị {currentDocs.length} / {filteredDocs.length} tài liệu</span>
          <div className="page-controls">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >Trước</button>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
            >Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAGDocuments;
