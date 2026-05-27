import api from './api';

export const documentService = {
  searchDocuments: async (params) => {
    const response = await api.get('/documents/search', { params });
    return response.data;
  },
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
  getFilterOptions: async () => {
    const response = await api.get('/documents/filter-options');
    return response.data;
  },
  getDocumentById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  }
};
