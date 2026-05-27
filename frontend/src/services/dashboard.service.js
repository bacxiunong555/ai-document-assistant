import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getRecentDocuments: async (limit = 5) => {
    const response = await api.get(`/dashboard/recent-documents?limit=${limit}`);
    return response.data;
  },
  
  getAiSuggestions: async () => {
    const response = await api.get('/dashboard/ai-suggestions');
    return response.data;
  }
};
