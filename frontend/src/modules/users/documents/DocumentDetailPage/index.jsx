import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { documentService } from '../../../../services/document.service';
import { workflowService } from '../../../../services/workflow.service';
import { updateDocument } from '../../../../services/drafting.service';
import { generateDocx, sanitizeFilename } from '../../../../utils/docxExporter';
import { saveAs } from 'file-saver';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import DocumentRenderer from '../../drafting/components/DocumentRenderer';
import SourcesPanel from '../../drafting/components/SourcesPanel';
import './DocumentDetail.css';

const StatusBadgeMap = {
  da_duyet: <span className="wf-step-status done">Đã duyệt</span>,
  cho_duyet: <span className="wf-step-status current">Chờ duyệt</span>,
  yeu_cau_sua: <span className="wf-step-status rejected">Yêu cầu sửa</span>,
  ban_nhap: <span className="wf-step-status pending">Bản nháp</span>,
};

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const location = useLocation();
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [docBackup, setDocBackup] = useState(null);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentService.getDocumentById(id);
      if (res.success && res.data) {
        setDoc(res.data);
      } else {
        setError({ status: 404, message: 'Không tìm thấy văn bản' });
      }
    } catch (err) {
      const status = err.response?.status || 500;
      let message = 'Đã xảy ra lỗi khi tải văn bản';
      if (status === 404) message = 'Không tìm thấy văn bản';
      if (status === 403) message = 'Bạn không có quyền xem văn bản này';
      setError({ status, message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doc && location.search.includes('edit=true') && !showEditForm) {
      const isDraft = doc.trang_thai === 'ban_nhap';
      const isEditable = isDraft || doc.trang_thai === 'yeu_cau_sua';
      if (isEditable) {
        startEdit();
        // Remove edit=true from URL without refreshing
        navigate(location.pathname, { replace: true });
      }
    }
  }, [doc, location.search, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const startEdit = () => {
    setDocBackup(JSON.parse(JSON.stringify(doc)));
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setDoc(docBackup);
    setShowEditForm(false);
  };

  const handleSaveEdit = async () => {
    setActionLoading(true);
    try {
      const payload = {
        title: doc.document_data.trich_yeu || doc.document_data.ten_loai || 'Văn bản mới',
        content: JSON.stringify(doc.document_data),
        doc_type: doc.document_data.ten_loai || 'Khác',
        status: doc.trang_thai,
      };
      await updateDocument(id, payload);
      setShowEditForm(false);
      fetchDocument();
    } catch (err) {
      alert('Lưu thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const updateField = (path, value) => {
    setDoc(prev => {
      const newDoc = { ...prev };
      let obj = newDoc.document_data;
      const keys = path.split('.');
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return newDoc;
    });
  };

  const handleSubmitApproval = async () => {
    setActionLoading(true);
    try {
      const res = await workflowService.submitForApproval(id);
      if (res.success) {
        setDoc(prev => ({ ...prev, trang_thai: 'cho_duyet' }));
      } else {
        alert(res.message || 'Lỗi khi gửi duyệt');
      }
    } catch (err) {
      console.error(err);
      alert('Gửi duyệt thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa văn bản này?')) return;
    setActionLoading(true);
    try {
      const res = await documentService.deleteDocument(id);
      if (res.success) {
        navigate('/documents');
      } else {
        alert(res.message || 'Lỗi khi xóa văn bản');
      }
    } catch (err) {
      console.error(err);
      alert('Xóa văn bản thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!doc || !doc.document_data) return;
    try {
      const blob = await generateDocx(doc.document_data, {});
      const filename = sanitizeFilename(doc.document_data.so_ky_hieu, doc.document_data.trich_yeu) + '.docx';
      saveAs(blob, filename);
    } catch (err) {
      console.error('DOCX export error:', err);
      alert('Có lỗi khi xuất file DOCX');
    }
  };

  if (loading) {
    return (
      <div className="doc-detail-loading">
        <div className="spinner" />
        <p>Đang tải văn bản...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doc-detail-error">
        <h2>{error.status === 403 ? '🔒 Quyền truy cập' : '⚠️ Lỗi'}</h2>
        <p>{error.message}</p>
        <button onClick={handleBack} className="btn-secondary">Quay lại</button>
      </div>
    );
  }

  const { trang_thai, so_hieu, loai_van_ban, ngay_tao } = doc;
  const isDraft = trang_thai === 'ban_nhap';
  const isEditable = isDraft || trang_thai === 'yeu_cau_sua';

  return (
    <div className="doc-detail-container">
      {/* PHẦN 1 — Header toolbar */}
      <div className="doc-detail-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', marginBottom: '16px' }}>
        <button onClick={handleBack} className="btn-back" style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '14px', color: 'var(--color-text)', padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Quay lại
        </button>
        {!showEditForm && (
          <div className="toolbar-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap' }}>
            {isEditable && (
              <button onClick={startEdit} className="btn-edit" disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary, #0ea5e9)', border: '1px solid var(--color-primary, #0ea5e9)', padding: '6px 12px', borderRadius: '4px', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <span className="action-text">Chỉnh sửa</span>
              </button>
            )}
            {isDraft && (
              <button onClick={handleSubmitApproval} className="btn-approve" disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'white', background: 'var(--color-success, #22c55e)', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                <span className="action-text">Gửi duyệt</span>
              </button>
            )}
            <button onClick={handleDownloadDocx} className="btn-download" disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text, #374151)', border: '1px solid var(--color-border, #d1d5db)', padding: '6px 12px', borderRadius: '4px', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span className="action-text">Tải xuống</span>
            </button>
            {isDraft && (
              <button onClick={handleDelete} className="btn-delete" disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger, #ef4444)', border: 'none', background: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }} title="Xóa">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            )}
          </div>
        )}
      </div>

      {showEditForm && (
        <div className="edit-form-panel" style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border, #e2e8f0)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'slideDown 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <p style={{ margin: 0, fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>Đang chỉnh sửa</p>
            <div className="toolbar" style={{ display: 'flex', gap: '2px', borderLeft: '1px solid #e5e7eb', paddingLeft: '16px', alignItems: 'center' }}>
              <button onMouseDown={e => { e.preventDefault(); document.execCommand('bold', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="In đậm"><Bold size={16} color="#4b5563" /></button>
              <button onMouseDown={e => { e.preventDefault(); document.execCommand('italic', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="In nghiêng"><Italic size={16} color="#4b5563" /></button>
              <button onMouseDown={e => { e.preventDefault(); document.execCommand('underline', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Gạch chân"><Underline size={16} color="#4b5563" /></button>
              <div style={{ width: '1px', background: '#cbd5e1', height: '16px', margin: '0 4px' }} />
              <button onMouseDown={e => { e.preventDefault(); document.execCommand('justifyLeft', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Căn trái"><AlignLeft size={16} color="#4b5563" /></button>
              <button onMouseDown={e => { e.preventDefault(); document.execCommand('justifyCenter', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Căn giữa"><AlignCenter size={16} color="#4b5563" /></button>
              <button onMouseDown={e => { e.preventDefault(); document.execCommand('justifyRight', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Căn phải"><AlignRight size={16} color="#4b5563" /></button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSaveEdit} className="btn-save" style={{ background: 'var(--color-primary, #0ea5e9)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }} disabled={actionLoading}>Lưu thay đổi</button>
            <button onClick={handleCancelEdit} className="btn-cancel" style={{ background: 'white', border: '1px solid var(--color-border, #cbd5e1)', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', color: '#475569', fontWeight: 500, fontSize: '13px' }} disabled={actionLoading}>Hủy</button>
          </div>
        </div>
      )}

      {/* PHẦN 2 — Nội dung văn bản */}
      <div className="doc-detail-content">
        <DocumentRenderer
          data={doc.document_data}
          status="done"
          errorMessage={null}
          isEditing={showEditForm}
          onFieldChange={updateField}
        />
      </div>

      {/* PHẦN 4 — Nguồn pháp lý RAG */}
      {doc.document_data?.sources && doc.document_data.sources.length > 0 && (
        <div className="doc-detail-sources">
          <SourcesPanel sources={doc.document_data.sources} />
        </div>
      )}
    </div>
  );
}
