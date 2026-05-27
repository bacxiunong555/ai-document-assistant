import { useState, useRef } from 'react';
import { DRAFT_API_URL, saveDocument, updateDocument } from '../services/drafting.service';

export function useDrafting() {
  const [documentData, setDocumentData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savedDocId, setSavedDocId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const abortControllerRef = useRef(null);
  const originalDataRef = useRef(null);

  const reset = () => {
    abortControllerRef.current?.abort();
    setDocumentData(null);
    setStatus('idle');
    setErrorMessage(null);
    setProcessingTime(null);
    setIsEditing(false);
    setSavedDocId(null);
    setSaveStatus(null);
    originalDataRef.current = null;
  };

  const generateDraft = async (payload) => {
    if (status === 'loading') {
      abortControllerRef.current?.abort();
    }

    setDocumentData(null);
    setErrorMessage(null);
    setProcessingTime(null);
    setStatus('loading');
    setIsEditing(false);
    setSavedDocId(null);
    setSaveStatus(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const startTime = Date.now();

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(DRAFT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || `Lỗi hệ thống (${res.status})`);
      }

      setDocumentData(json.data);
      setProcessingTime((Date.now() - startTime) / 1000);
      setStatus('done');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  const startEdit = () => {
    originalDataRef.current = JSON.parse(JSON.stringify(documentData));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (originalDataRef.current) {
      setDocumentData(originalDataRef.current);
    }
    setIsEditing(false);
  };

  const updateField = (path, value) => {
    setDocumentData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!documentData) return;
    setSaveStatus('saving');

    try {
      const payload = {
        title: documentData.trich_yeu || documentData.ten_loai || 'Văn bản mới',
        content: JSON.stringify(documentData),
        doc_type: documentData.ten_loai || 'Khác',
        status: 'ban_nhap',
      };

      if (savedDocId) {
        await updateDocument(savedDocId, payload);
      } else {
        const res = await saveDocument(payload);
        if (res.data?.id) {
          setSavedDocId(res.data.id);
        }
      }

      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return {
    documentData,
    status,
    errorMessage,
    processingTime,
    isEditing,
    savedDocId,
    saveStatus,
    generateDraft,
    reset,
    startEdit,
    cancelEdit,
    updateField,
    handleSave,
  };
}
