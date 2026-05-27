import api from './api';

export const exportService = {
  getExportableDocuments: async () => {
    const response = await api.get('/export/documents');
    return response.data;
  },

  downloadDocuments: async (docIds, format = 'pdf') => {
    const response = await api.post('/export/download', 
      { doc_ids: docIds, format },
      { responseType: 'blob' }
    );
    return response;
  }
};
