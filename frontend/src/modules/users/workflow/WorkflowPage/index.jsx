import React, { useState, useEffect, useCallback } from 'react';
import { workflowService } from '../../../../services/workflow.service';
import { 
  Clock, CircleCheck, CircleX, ChevronRight, Send, AlertCircle, Check
} from 'lucide-react';
import './Workflow.css';

const AVATAR_COLORS = ['red', 'orange', 'green', 'blue', 'purple'];

const getInitial = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts[parts.length - 1]?.[0]?.toUpperCase() || '?';
};

const StatusLabels = {
  cho_duyet: 'Đang chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Đã từ chối',
};

export default function WorkflowPage() {
  const [tab, setTab] = useState('cho_duyet');
  const [counts, setCounts] = useState({ cho_duyet: 0, da_duyet: 0, tu_choi: 0 });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await workflowService.getCounts();
      if (res.data) setCounts(res.data);
    } catch (err) {
      console.error('Counts error:', err);
    }
  }, []);

  const fetchDocuments = useCallback(async (currentTab = tab) => {
    setLoading(true);
    try {
      const res = await workflowService.getDocuments(currentTab);
      if (res.data) setDocuments(res.data);
    } catch (err) {
      console.error('Documents error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (docId) => {
    setDetailLoading(true);
    try {
      const res = await workflowService.getDetail(docId);
      if (res.data) setDetail(res.data);
    } catch (err) {
      console.error('Detail error:', err);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    fetchDocuments('cho_duyet');
  }, []);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelectedId(null);
    setDetail(null);
    fetchDocuments(newTab);
  };

  const handleSelectDoc = (docId) => {
    setSelectedId(docId);
    fetchDetail(docId);
  };

  const getStepDotClass = (step) => {
    if (step.trang_thai === 'da_duyet') return 'done';
    if (step.trang_thai === 'tu_choi') return 'rejected';
    if (step.trang_thai === 'cho_duyet') return 'current';
    return 'pending';
  };

  return (
    <div className="wf-container">
      {/* TABS */}
      <div className="wf-tabs">
        <button className={`wf-tab ${tab === 'cho_duyet' ? 'active' : ''}`} onClick={() => handleTabChange('cho_duyet')} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
          <Clock size={16} /> Chờ duyệt
          <span className="wf-tab-count">{counts.cho_duyet}</span>
        </button>
        <button className={`wf-tab ${tab === 'da_duyet' ? 'active' : ''}`} onClick={() => handleTabChange('da_duyet')} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
          <CircleCheck size={16} /> Đã duyệt
          <span className="wf-tab-count">{counts.da_duyet}</span>
        </button>
        <button className={`wf-tab ${tab === 'tu_choi' ? 'active' : ''}`} onClick={() => handleTabChange('tu_choi')} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
          <CircleX size={16} /> Từ chối
          <span className="wf-tab-count">{counts.tu_choi}</span>
        </button>
      </div>

      <div className="wf-layout">
        {/* LEFT: Document List */}
        <div className="wf-list-card">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="wf-skeleton">
                <div className="wf-skel-line w50"></div>
                <div className="wf-skel-line w80"></div>
                <div className="wf-skel-line w30"></div>
              </div>
            ))
          ) : documents.length > 0 ? (
            documents.map((doc, idx) => (
              <div 
                key={doc.id} 
                className={`wf-doc-item ${selectedId === doc.id ? 'selected' : ''}`}
                onClick={() => handleSelectDoc(doc.id)}
              >
                <div className="wf-icon-left" style={{ marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', backgroundColor: '#fef3c7', borderRadius: '50%' }}>
                  <Clock size={20} color="#f59e0b" />
                </div>
                <div className="wf-doc-body">
                  <div className="wf-doc-top">
                    <span className="wf-so-hieu">{doc.so_hieu}</span>
                    {doc.is_khan && <span className="wf-badge-khan" style={{display: 'flex', alignItems: 'center', gap: '4px'}}><AlertCircle size={12} color="white" /> Khẩn</span>}
                  </div>
                  <p className="wf-doc-title">{doc.tieu_de}</p>
                  <p className="wf-doc-meta">
                    Gửi lúc: {doc.ngay_gui}
                    <span>•</span>
                    Bước {doc.buoc_hien_tai}/{doc.tong_buoc}
                  </p>
                  <div className="wf-approver-line">
                    <div className="wf-approver-avatar">{getInitial(doc.nguoi_duyet)}</div>
                    Đang chờ: <span className="wf-approver-name">{doc.nguoi_duyet}</span>
                    {doc.chuc_vu_duyet && <span>({doc.chuc_vu_duyet})</span>}
                  </div>
                </div>
                <div className="wf-arrow"><ChevronRight size={18} color="#6b7280" /></div>
              </div>
            ))
          ) : (
            <div className="wf-empty-list">
              Không có văn bản nào trong mục này
            </div>
          )}
        </div>

        {/* RIGHT: Detail Panel */}
        <div className="wf-detail-card">
          <h3 className="wf-detail-title" style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6'}}>
            <Send size={18} /> Quy trình phê duyệt
          </h3>

          {!selectedId ? (
            <div className="wf-empty-state">
              <div className="wf-empty-icon"><Send size={48} color="#d1d5db" /></div>
              <p>Chọn một văn bản để xem chi tiết quy trình phê duyệt</p>
            </div>
          ) : detailLoading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ width: 24, height: 24, border: '2px solid #e5e7eb', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'wfShimmer 1s linear infinite', margin: '0 auto' }}></div>
            </div>
          ) : detail ? (
            <div>
              <div style={{ marginBottom: 20, padding: '12px', background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>{detail.so_hieu}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{detail.tieu_de}</div>
              </div>

              {detail.cac_buoc.length > 0 ? (
                <div className="wf-timeline">
                  {detail.cac_buoc.map((step, i) => {
                    const dotClass = getStepDotClass(step);
                    return (
                      <div key={step.id || i} className="wf-step">
                        <div className={`wf-step-dot ${dotClass}`} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          {dotClass === 'done' ? <Check size={12} color="white" strokeWidth={3} /> : step.buoc}
                        </div>
                        <div className="wf-step-name">{step.nguoi_duyet}</div>
                        <div className="wf-step-role">{step.chuc_vu}</div>
                        <span className={`wf-step-status ${dotClass}`}>
                          {StatusLabels[step.trang_thai] || step.trang_thai}
                        </span>
                        {step.ghi_chu && <div className="wf-step-note">{step.ghi_chu}</div>}
                        {step.ngay_cap_nhat && <div className="wf-step-date">{step.ngay_cap_nhat}</div>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="wf-empty-state">
                  <p>Chưa có quy trình phê duyệt được tạo</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
