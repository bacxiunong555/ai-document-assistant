import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentSearch } from '../../../../hooks/useDocumentSearch';
import { 
  Search, Filter, Calendar, MoreHorizontal, FileX 
} from 'lucide-react';
import './DocumentSearch.css';

const getStatusBadge = (status) => {
  switch (status) {
    case 'da_duyet': return <span className="status-badge badge-da_duyet">Đã duyệt</span>;
    case 'cho_duyet': return <span className="status-badge badge-cho_duyet">Chờ duyệt</span>;
    case 'yeu_cau_sua': return <span className="status-badge badge-yeu_cau_sua">Yêu cầu sửa</span>;
    case 'ban_nhap': return <span className="status-badge badge-ban_nhap">Bản nháp</span>;
    default: return <span className="status-badge badge-ban_nhap">{status}</span>;
  }
};

const ActionMenu = ({ id, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa văn bản này?")) {
      onDelete(id);
    }
    setIsOpen(false);
  };

  return (
    <div className="action-menu-wrapper" ref={menuRef}>
      <button className="action-btn" onClick={() => setIsOpen(!isOpen)}>
        <MoreHorizontal size={18} color="#6b7280" />
      </button>
      {isOpen && (
        <div className="action-dropdown">
          <button onClick={() => navigate(`/documents/${id}`)}>Xem chi tiết</button>
          <button onClick={() => navigate(`/documents/${id}?edit=true`)}>Chỉnh sửa</button>
          <button className="delete-btn" onClick={handleDelete}>Xóa</button>
        </div>
      )}
    </div>
  );
};

export default function DocumentSearchPage() {
  const {
    results,
    total,
    loading,
    error,
    page,
    limit,
    filters,
    selectedIds,
    filterOptions,
    search,
    changePage,
    updateFilter,
    resetFilters,
    toggleSelect,
    selectAll,
    deleteSelected,
    deleteSingle
  } = useDocumentSearch();

  const [showFilter, setShowFilter] = useState(false);

  const activeFiltersCount = [filters.loai, filters.trang_thai].filter(Boolean).length;

  const handleSearchClick = () => {
    search(filters, 1);
  };

  return (
    <div className="doc-search-container">
      {/* HEADER */}
      <div className="doc-search-header">
        <h1>Tra cứu văn bản</h1>
        <p>Tra cứu và quản lý kho văn bản</p>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="search-filter-card">
        <div className="search-row">
          <div className="search-input-wrapper">
            <span className="search-icon"><Search size={16} color="#9ca3af" /></span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Tìm kiếm theo số văn bản, tiêu đề..." 
              value={filters.q}
              onChange={(e) => updateFilter('q', e.target.value)}
            />
          </div>
          <button className="filter-btn" onClick={() => setShowFilter(!showFilter)} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <Filter size={16} color="#6b7280" /> Bộ lọc
            {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
          </button>
          <button className="search-btn" onClick={handleSearchClick} style={{display: 'flex', alignItems: 'center', gap: '6px', background: '#0f766e', color: 'white'}}>
            <Search size={16} color="white" /> Tìm kiếm
          </button>
        </div>

        {showFilter && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>Loại văn bản</label>
              <select 
                className="filter-select"
                value={filters.loai}
                onChange={(e) => updateFilter('loai', e.target.value)}
              >
                <option value="">Tất cả</option>
                {filterOptions.loai_van_ban.map((loai, i) => (
                  <option key={i} value={loai}>{loai}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Trạng thái</label>
              <select 
                className="filter-select"
                value={filters.trang_thai}
                onChange={(e) => updateFilter('trang_thai', e.target.value)}
              >
                <option value="">Tất cả</option>
                {filterOptions.trang_thai.map((tt, i) => {
                  const label = tt === 'da_duyet' ? 'Đã duyệt' 
                              : tt === 'cho_duyet' ? 'Chờ duyệt' 
                              : tt === 'yeu_cau_sua' ? 'Yêu cầu sửa' 
                              : 'Bản nháp';
                  return <option key={i} value={tt}>{label}</option>
                })}
              </select>
            </div>
            <button className="reset-btn" onClick={resetFilters}>Đặt lại</button>
          </div>
        )}
      </div>

      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

      {/* RESULTS TABLE */}
      <div className="results-card">
        <div className="results-header">
          <h3>Kết quả tìm kiếm ({total} văn bản)</h3>
          {selectedIds.length > 0 && (
            <button 
              className="reset-btn" 
              style={{ color: '#ef4444', borderColor: '#ef4444' }}
              onClick={() => {
                if (window.confirm(`Xóa ${selectedIds.length} văn bản đã chọn?`)) {
                  deleteSelected();
                }
              }}
            >
              Xóa {selectedIds.length} mục
            </button>
          )}
        </div>

        <div className="table-wrapper">
          <table className="doc-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input 
                    type="checkbox" 
                    checked={results.length > 0 && selectedIds.length === results.length}
                    onChange={selectAll}
                    disabled={results.length === 0}
                  />
                </th>
                <th>Số văn bản</th>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                ))
              ) : results.length > 0 ? (
                results.map(doc => (
                  <tr key={doc.id} className={selectedIds.includes(doc.id) ? 'selected' : ''}>
                    <td className="checkbox-cell">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(doc.id)}
                        onChange={() => toggleSelect(doc.id)}
                      />
                    </td>
                    <td>
                      {doc.so_hieu !== 'Chưa có' ? (
                        <Link to={`/documents/${doc.id}`} className="so-hieu-link">{doc.so_hieu}</Link>
                      ) : (
                        <span className="so-hieu-empty">Chưa có</span>
                      )}
                    </td>
                    <td>
                      <p className="title-primary">{doc.tieu_de}</p>
                      <p className="title-secondary">{doc.nguoi_soan} · {doc.phong_ban}</p>
                    </td>
                    <td>
                      <span className="type-badge">{doc.loai_van_ban}</span>
                    </td>
                    <td>
                      {getStatusBadge(doc.trang_thai)}
                    </td>
                    <td>
                      <div className="date-cell" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                        <Calendar size={14} color="#9ca3af" /> {doc.ngay_tao}
                      </div>
                    </td>
                    <td>
                      <ActionMenu id={doc.id} onDelete={deleteSingle} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <FileX size={48} color="#d1d5db" />
                      <p style={{ marginTop: '16px', fontSize: '15px' }}>Không tìm thấy văn bản phù hợp</p>
                      {activeFiltersCount > 0 || filters.q ? (
                        <button className="reset-btn" style={{ marginTop: '8px' }} onClick={resetFilters}>Xóa bộ lọc</button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && total > limit && (
          <div className="pagination">
            <span className="page-info">Trang {page} / {Math.ceil(total / limit)}</span>
            <button 
              className="page-btn" 
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
            >
              Trước
            </button>
            <button 
              className="page-btn"
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => changePage(page + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
