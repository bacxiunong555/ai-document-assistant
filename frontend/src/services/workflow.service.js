import api from './api';

export const workflowService = {
  getDocuments: async (tab = 'cho_duyet') => {
    const response = await api.get('/workflow/documents', { params: { tab } });
    return response.data;
  },
  getCounts: async () => {
    const response = await api.get('/workflow/counts');
    return response.data;
  },
  getDetail: async (docId) => {
    const response = await api.get(`/workflow/detail/${docId}`);
    return response.data;
  },
  submitForApproval: async (docId) => {
    const response = await api.post(`/workflow/submit/${docId}`);
    return response.data;
  }
};
