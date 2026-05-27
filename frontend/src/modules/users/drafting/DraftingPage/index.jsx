import React, { useState, useEffect } from 'react';
import { useDrafting } from '../../../../hooks/useDrafting';
import DraftingForm from '../components/DraftingForm';
import DocumentRenderer from '../components/DocumentRenderer';
import SourcesPanel from '../components/SourcesPanel';
import { 
  FileEdit, FileText, Send, Printer, 
  ChevronLeft, ChevronRight, X,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import './DraftingPage.css';

export default function DraftingPage() {
  const {
    documentData, status, errorMessage, processingTime,
    isEditing, savedDocId, saveStatus,
    generateDraft, reset, startEdit, cancelEdit, updateField, handleSave,
  } = useDrafting();

  const [isFormVisible, setIsFormVisible] = useState(() => {
    const saved = localStorage.getItem('drafting_form_visible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('drafting_form_visible', JSON.stringify(isFormVisible));
  }, [isFormVisible]);

  useEffect(() => {
    if (status === 'done') {
      setIsFormVisible(false);
    }
  }, [status]);

  const handlePrint = () => {
    const oldTitle = document.title;
    if (documentData) {
      const name = documentData.so_ky_hieu || documentData.trich_yeu || 'Van_ban';
      document.title = name.replace(/[/\\?%*:|"<>\s]/g, '_');
    }
    window.print();
    document.title = oldTitle;
  };

  return (
    <div className="drafting-page">
      <header className="page-header">
        <h2>Soạn thảo văn bản hành chính</h2>
        <p>Tạo văn bản chuẩn form NĐ 30/2020/NĐ-CP với AI RAG</p>
      </header>

      <div className="drafting-layout">
        <div className={`form-panel card ${!isFormVisible ? 'hidden' : ''}`}>
          <DraftingForm
            status={status}
            onSubmit={generateDraft}
            onCancel={reset}
          />
        </div>

        <div className="editor-panel card" style={{ padding: 0, backgroundColor: '#f0f0f0' }}>
          <div className="editor-panel-header" style={{ padding: '16px', backgroundColor: 'white', margin: 0, flexWrap: 'nowrap', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button 
                className="btn-toggle-form" 
                onClick={() => setIsFormVisible(!isFormVisible)}
                title={isFormVisible ? "Ẩn form" : "Hiện form"}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isFormVisible ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileEdit size={18} color="#3b82f6" /> Soạn thảo văn bản
              </h3>
              {processingTime && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>({processingTime}s)</span>}
              <span className={`status-badge status-${status}`}>
                {status === 'idle' && 'Chờ soạn'}
                {status === 'loading' && 'Đang soạn'}
                {status === 'done' && 'Hoàn thành'}
                {status === 'error' && 'Lỗi'}
              </span>
              {saveStatus === 'saved' && (
                <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>✅</span>
              )}
            </div>

            <div className="editor-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap', flexShrink: 0 }}>
              {status === 'done' && documentData && (
                <>
                  {!isEditing ? (
                    <>
                      <button onClick={handleSave} className="btn-draft" disabled={saveStatus === 'saving'}>
                        <span className="icon" style={{display: 'flex'}}><FileText size={16} color="#6b7280" /></span> <span className="text">{saveStatus === 'saving' ? 'Đang lưu' : savedDocId ? 'Cập nhật' : 'Lưu nháp'}</span>
                      </button>
                      <button onClick={startEdit} className="btn-edit-outline">
                        <span className="icon" style={{display: 'flex'}}><FileEdit size={16} color="#6b7280" /></span> <span className="text">Chỉnh sửa</span>
                      </button>
                      <button className="btn-save" style={{display: 'flex', alignItems: 'center', gap: '6px', background: '#0f766e', color: 'white'}}>
                        <Send size={16} color="white" /> <span className="text">Gửi duyệt</span>
                      </button>
                      <button onClick={handlePrint} className="btn-secondary" style={{ padding: '4px 12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Printer size={16} color="#6b7280" /> In / PDF
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="toolbar" style={{ display: 'flex', gap: '2px', borderRight: '1px solid #e5e7eb', paddingRight: '12px', marginRight: '4px', alignItems: 'center' }}>
                        <button onMouseDown={e => { e.preventDefault(); document.execCommand('bold', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="In đậm"><Bold size={16} color="#4b5563" /></button>
                        <button onMouseDown={e => { e.preventDefault(); document.execCommand('italic', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="In nghiêng"><Italic size={16} color="#4b5563" /></button>
                        <button onMouseDown={e => { e.preventDefault(); document.execCommand('underline', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Gạch chân"><Underline size={16} color="#4b5563" /></button>
                        <div style={{ width: '1px', background: '#cbd5e1', height: '16px', margin: '0 4px' }} />
                        <button onMouseDown={e => { e.preventDefault(); document.execCommand('justifyLeft', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Căn trái"><AlignLeft size={16} color="#4b5563" /></button>
                        <button onMouseDown={e => { e.preventDefault(); document.execCommand('justifyCenter', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Căn giữa"><AlignCenter size={16} color="#4b5563" /></button>
                        <button onMouseDown={e => { e.preventDefault(); document.execCommand('justifyRight', false, null); }} className="btn-toolbar" style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Căn phải"><AlignRight size={16} color="#4b5563" /></button>
                      </div>
                      <button onClick={handleSave} className="btn-save" disabled={saveStatus === 'saving'}>
                        <span className="icon" style={{display: 'flex'}}><FileText size={16} color="white" /></span> <span className="text">{saveStatus === 'saving' ? 'Đang lưu' : 'Lưu'}</span>
                      </button>
                      <button onClick={cancelEdit} className="btn-cancel-edit">
                        <span className="icon" style={{display: 'flex'}}><X size={16} color="#ef4444" /></span> <span className="text" style={{color: '#ef4444'}}>Hủy sửa</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
            <DocumentRenderer
              data={documentData}
              status={status}
              errorMessage={errorMessage}
              isEditing={isEditing}
              onFieldChange={updateField}
            />
            {status === 'done' && documentData?.sources && (
              <SourcesPanel sources={documentData.sources} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
