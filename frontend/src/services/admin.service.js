import api from './api';

export const adminService = {
  // --- Admin Overview ---
  getStats: () => api.get('/admin/stats'),
  getSystemHealth: () => api.get('/admin/system-health'),
  getRagCategories: () => api.get('/admin/rag-categories'),
  getRecentActivities: () => api.get('/admin/recent-activities'),

  // --- System Monitor ---
  getSystemMonitor: () => api.get('/admin/system-monitor'),

  // --- Users ---
  getUsers: () => api.get('/admin/users'),
  getUserStats: () => api.get('/admin/user-stats'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // --- RAG Documents ---
  getRagDocuments: () => api.get('/admin/rag-documents'),
  getRagStats: () => api.get('/admin/rag-stats'),
  reindexRagDocuments: () => api.post('/admin/rag-documents/reindex'),
  deleteRagDocument: (id) => api.delete(`/admin/rag-documents/${id}`),

  // --- Upload ---
  getUploadHistory: () => api.get('/admin/upload-history'),

  uploadDocuments: (files, config) => {
    const form = new FormData();
    files.forEach(f => form.append('files', f.rawFile));
    form.append('category', config.category || 'general');
    form.append('chunk_size', config.chunkSize || 1000);
    form.append('chunk_overlap', config.chunkOverlap || 200);
    return api.post('/admin/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};
