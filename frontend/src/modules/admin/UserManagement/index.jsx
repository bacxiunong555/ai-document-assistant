import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/admin.service';
import { 
  Users, UserCheck, UserX, Lock, UserPlus, Search, MoreHorizontal,
  Eye, Edit2, Shield, Mail, Trash2 
} from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    department: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const itemsPerPage = 6;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getUserStats()
      ]);
      setUsers(usersRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ fullName: '', email: '', role: '', department: '' });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role || '',
      department: user.department || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitUser = async () => {
    try {
      if (editingUser) {
        const res = await adminService.updateUser(editingUser.id, formData);
        if (res.data.success) {
          alert(res.data.message);
          setIsAddModalOpen(false);
          fetchUsers();
        }
      } else {
        const res = await adminService.createUser(formData);
        if (res.data.success) {
          alert(res.data.message);
          setIsAddModalOpen(false);
          fetchUsers();
        }
      }
    } catch (error) {
      alert(editingUser ? "Lỗi khi cập nhật tài khoản" : "Lỗi khi tạo tài khoản");
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này khỏi hệ thống không? Hành động này không thể hoàn tác.")) {
      try {
        const res = await adminService.deleteUser(userId);
        if (res.data.success) {
          alert("Đã xóa người dùng thành công");
          fetchUsers(); // Refresh table
        }
      } catch (error) {
        alert("Lỗi khi xóa người dùng");
        console.error(error);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    if (user.role && user.role.toLowerCase() === 'admin') return false;
    if (searchTerm && !user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) && !user.email?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (deptFilter && user.department !== deptFilter) return false;
    if (statusFilter && user.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="rag-documents-container">
      {/* Page Header */}
      <div className="rag-page-header">
        <h2>Quản lý người dùng</h2>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="rag-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="rag-stat-box">
            <div className="stat-icon-wrapper bg-blue-100 text-blue-600" style={{background: 'transparent', padding: 0}}>
              <span className="stat-icon"><Users size={24} color="#3b82f6" /></span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalUsers}</span>
              <span className="stat-label">Tổng người dùng</span>
            </div>
          </div>
          <div className="rag-stat-box">
            <div className="stat-icon-wrapper bg-green-100 text-green-600" style={{background: 'transparent', padding: 0}}>
              <span className="stat-icon"><UserCheck size={24} color="#10b981" /></span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.activeUsers}</span>
              <span className="stat-label">Đang hoạt động</span>
            </div>
          </div>
          <div className="rag-stat-box">
            <div className="stat-icon-wrapper bg-orange-100 text-orange-600" style={{background: 'transparent', padding: 0}}>
              <span className="stat-icon"><UserX size={24} color="#6b7280" /></span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.inactiveUsers}</span>
              <span className="stat-label">Không hoạt động</span>
            </div>
          </div>
          <div className="rag-stat-box">
            <div className="stat-icon-wrapper bg-red-100 text-red-600" style={{background: 'transparent', padding: 0}}>
              <span className="stat-icon"><Lock size={24} color="#ef4444" /></span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.lockedUsers}</span>
              <span className="stat-label">Đã khóa</span>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="rag-table-card">
        <div className="rag-table-header">
          <h2>Danh sách người dùng</h2>
          <div className="rag-header-actions">
            <button className="rag-btn-primary" onClick={openAddModal}>
              <span className="icon-mr">
                <UserPlus size={16} color="white" />
              </span>
              Thêm người dùng
            </button>
          </div>
        </div>

        <div className="rag-table-filters">
          <div className="search-wrapper full-width">
            <span className="admin-search-icon"><Search size={16} color="#9ca3af" /></span>
            <input 
              type="text" 
              placeholder="Tìm kiếm người dùng..." 
              className="filter-input-search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdowns">
            <select className="filter-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="">Tất cả phòng ban</option>
              <option value="Hành chính">Hành chính</option>
              <option value="Đào tạo">Đào tạo</option>
              <option value="Ban Quản trị">Ban Quản trị</option>
            </select>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Không hoạt động">Không hoạt động</option>
              <option value="Đã khóa">Đã khóa</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Phòng ban</th>
                <th>Trạng thái</th>
                <th>Đăng nhập gần nhất</th>
                <th>Văn bản</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Đang tải...</td></tr>
              ) : currentUsers.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Không có dữ liệu</td></tr>
              ) : (
                currentUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="doc-name-col">
                        <div className="user-avatar-box">
                          {user.fullName ? user.fullName.charAt(0) : 'U'}
                        </div>
                        <div className="user-info">
                          <div className="font-medium text-dark">{user.fullName}</div>
                          <div className="text-sm text-gray">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.department}</td>
                    <td>
                      <div className={`status-badge-styled ${
                        user.status === 'Hoạt động' ? 'success' : 
                        user.status === 'Đã khóa' ? 'error' : 'processing'
                      }`}>
                        <span className="status-icon" style={{marginRight: '6px', display: 'flex'}}>
                          {user.status === 'Hoạt động' ? <UserCheck size={14} color="#10b981" /> : user.status === 'Đã khóa' ? <Lock size={14} color="#ef4444" /> : <UserX size={14} color="#6b7280" />}
                        </span>
                        {user.status}
                      </div>
                    </td>
                    <td className="text-gray">{user.lastLogin}</td>
                    <td>{user.docsCount}</td>
                    <td>
                      <div className="action-dropdown-wrapper">
                         <button className="icon-btn-more" style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px'}}>
                           <MoreHorizontal size={18} color="#6b7280" />
                         </button>
                         <div className="action-dropdown-menu">
                            <div className="action-item" onClick={() => handleEditClick(user)}>
                              <span className="icon" style={{display: 'flex'}}><Eye size={16} /></span> Xem chi tiết
                            </div>
                            <div className="action-item" onClick={() => handleEditClick(user)}>
                              <span className="icon" style={{display: 'flex'}}><Edit2 size={16} /></span> Chỉnh sửa
                            </div>
                            <div className="action-item">
                              <span className="icon" style={{display: 'flex'}}><Shield size={16} /></span> Phân quyền
                            </div>
                            <div className="action-item">
                              <span className="icon" style={{display: 'flex'}}><Mail size={16} /></span> Gửi email
                            </div>
                            <div className="action-item">
                              <span className="icon" style={{display: 'flex'}}><Lock size={16} /></span> Khóa tài khoản
                            </div>
                            <div className="action-item text-red" onClick={() => handleDeleteUser(user.id)}>
                              <span className="icon" style={{display: 'flex'}}><Trash2 size={16} /></span> Xóa tài khoản
                            </div>
                         </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="page-info">Hiển thị {currentUsers.length} / {filteredUsers.length} người dùng</span>
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

      {/* Add/Edit User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-header-content">
                <h2 className="modal-title">{editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</h2>
                <p className="modal-subtitle">{editingUser ? 'Thay đổi thông tin tài khoản' : 'Điền thông tin để tạo tài khoản người dùng mới'}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  className="form-control-modal" 
                  placeholder="Nguyễn Văn A" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  className="form-control-modal" 
                  placeholder="email@gov.vn" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Vai trò</label>
                <select 
                  className="form-control-modal"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="">Chọn vai trò</option>
                  <option value="Chuyên viên">Chuyên viên</option>
                  <option value="Lãnh đạo">Lãnh đạo</option>
                  <option value="Admin">Quản trị viên</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Phòng ban</label>
                <select 
                  className="form-control-modal"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Chọn phòng ban</option>
                  <option value="Phòng Hành chính">Phòng Hành chính</option>
                  <option value="Phòng Đào tạo">Phòng Đào tạo</option>
                  <option value="Ban Giám đốc">Ban Giám đốc</option>
                  <option value="Phòng Tổng hợp">Phòng Tổng hợp</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="user-btn-cancel" onClick={() => setIsAddModalOpen(false)}>Hủy</button>
              <button className="user-btn-submit" onClick={handleSubmitUser}>{editingUser ? 'Cập nhật' : 'Tạo tài khoản'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
