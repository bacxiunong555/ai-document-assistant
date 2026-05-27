import api from './api.js';

export const getDocTypes = async () => {
  const res = await api.get('/drafting/doc-types');
  return res.data;
};

export const getTemplates = async (docType) => {
  const params = docType ? { doc_type: docType } : {};
  const res = await api.get('/drafting/templates', { params });
  return res.data;
};

export const saveDocument = async (data) => {
  const res = await api.post('/documents', data);
  return res.data;
};

export const updateDocument = async (id, data) => {
  const res = await api.put(`/documents/${id}`, data);
  return res.data;
};

export const DRAFT_API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/drafting/generate`;
