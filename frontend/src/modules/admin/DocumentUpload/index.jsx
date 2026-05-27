import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../../../services/admin.service';
import {
  FileText, Settings, UploadCloud, X, Zap, Database,
  CheckCircle2, XCircle, Loader2, RefreshCw, Clock
} from 'lucide-react';
import './DocumentUpload.css';

const CATEGORY_OPTIONS = [
  { value: 'general',    label: 'Tổng hợp (tự động phát hiện)' },
  { value: 'cong-van',   label: 'Công văn' },
  { value: 'quyet-dinh', label: 'Quyết định' },
  { value: 'to-trinh',   label: 'Tờ trình' },
  { value: 'bao-cao',    label: 'Báo cáo' },
  { value: 'ke-hoach',   label: 'Kế hoạch' },
];

const STATUS_ICON = {
  'Đã index':      <CheckCircle2 size={16} color="#10b981" />,
  'Đang xử lý':   <Loader2 size={16} color="#f59e0b" className="spin" />,
  'Lỗi':          <XCircle size={16} color="#ef4444" />,
};

const DocumentUpload = () => {
  const [history, setHistory]           = useState([]);
  const [histLoading, setHistLoading]   = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);   // { name, size, rawFile }
  const [uploading, setUploading]       = useState(false);
  const [uploadResult, setUploadResult] = useState(null);   // {success, message}
  const [dragging, setDragging]         = useState(false);
  const [config, setConfig] = useState({
    category: 'general',
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const inputRef = useRef();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistLoading(true);
    try {
      const res = await adminService.getUploadHistory();
      setHistory(res.data.data || []);
    } catch {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  };

  const addFiles = (fileList) => {
    const ALLOWED = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/markdown'];
    const news = Array.from(fileList)
      .filter(f => ALLOWED.includes(f.type) || /\.(pdf|docx?|txt|md)$/i.test(f.name))
      .map(f => ({ name: f.name, size: f.size, rawFile: f }));
    setSelectedFiles(prev => [...prev, ...news]);
    setUploadResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const res = await adminService.uploadDocuments(selectedFiles, config);
      setUploadResult({ success: true, message: res.data.message });
      setSelectedFiles([]);
      setTimeout(loadHistory, 1500); // refresh history sau khi xử lý
    } catch (err) {
      setUploadResult({ success: false, message: err.response?.data?.message || 'Upload thất bại' });
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <div className="doc-upload-container">

      <div className="upload-top-row">
        {/* LEFT: Upload Area */}
        <div className="upload-card main-card">
          <div className="card-header upload-card-header no-border">
            <span className="card-icon"><FileText size={20} color="#3b82f6" /></span>
            <h2>Upload tài liệu vào RAG</h2>
          </div>

          <div className="upload-main-area">
            {/* Dropzone */}
            <div
              className={`upload-dropzone ${selectedFiles.length > 0 ? 'has-files' : ''} ${dragging ? 'dragging' : ''}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="dropzone-content">
                <UploadCloud size={48} color={dragging ? '#3b82f6' : '#94a3b8'} />
                <h3>{dragging ? 'Thả file vào đây' : 'Kéo thả file hoặc click để chọn'}</h3>
                <p>Hỗ trợ: PDF, DOC, DOCX, TXT, MD (tối đa 50MB/file)</p>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md"
                  className="file-input-hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>
            </div>

            {/* Upload result banner */}
            {uploadResult && (
              <div className={`upload-result-banner ${uploadResult.success ? 'success' : 'error'}`}>
                {uploadResult.success
                  ? <CheckCircle2 size={16} />
                  : <XCircle size={16} />}
                {uploadResult.message}
              </div>
            )}

            {/* File list */}
            {selectedFiles.length > 0 && (
              <div className="selected-files-container">
                <div className="file-list-header">
                  <h4>Danh sách file ({selectedFiles.length})</h4>
                  <div className="file-status-badges">
                    <span className="status-badge-outline gray">{selectedFiles.length} chờ upload</span>
                  </div>
                </div>
                <div className="file-list-items">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="file-item-card">
                      <div className="file-item-left">
                        <FileText size={16} color="#3b82f6" />
                        <div className="file-item-info">
                          <div className="file-item-name">{f.name}</div>
                          <div className="file-item-size">{formatSize(f.size)}</div>
                        </div>
                      </div>
                      <div className="file-item-right">
                        <span className="file-item-status">Chờ xử lý</span>
                        <button
                          className="file-item-remove"
                          onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, j) => j !== i)); }}
                        >
                          <X size={14} color="#6b7280" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="file-list-footer">
                  <button className="rag-btn-outline" onClick={() => setSelectedFiles([])}>Xóa tất cả</button>
                  <button className="rag-btn-primary" onClick={handleUpload} disabled={uploading}>
                    <span className="icon-mr">
                      {uploading ? <Loader2 size={16} color="white" className="spin" /> : <Zap size={16} color="white" />}
                    </span>
                    {uploading ? 'Đang upload...' : `Upload & Index (${selectedFiles.length} files)`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Config */}
        <div className="upload-card config-card">
          <div className="card-header upload-card-header">
            <span className="card-icon"><Settings size={20} color="#6b7280" /></span>
            <h2>Cấu hình</h2>
          </div>

          <div className="form-group">
            <label>Danh mục</label>
            <select
              className="upload-form-control"
              value={config.category}
              onChange={(e) => setConfig(c => ({ ...c, category: e.target.value }))}
            >
              {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Embedding Model</label>
            <select className="upload-form-control" disabled>
              <option>paraphrase-multilingual-MiniLM-L12-v2</option>
            </select>
            <span className="help-text">Model đang dùng để tạo vector embeddings</span>
          </div>

          <div className="form-group">
            <label>Chunk Size</label>
            <input
              type="number"
              className="upload-form-control"
              value={config.chunkSize}
              min={500} max={4000}
              onChange={(e) => setConfig(c => ({ ...c, chunkSize: Number(e.target.value) }))}
            />
            <span className="help-text">Số ký tự tối đa mỗi chunk (500–4000)</span>
          </div>

          <div className="form-group">
            <label>Chunk Overlap</label>
            <input
              type="number"
              className="upload-form-control"
              value={config.chunkOverlap}
              min={0} max={config.chunkSize / 2}
              onChange={(e) => setConfig(c => ({ ...c, chunkOverlap: Number(e.target.value) }))}
            />
            <span className="help-text">Số ký tự trùng lặp giữa các chunks</span>
          </div>

          <div className="config-status-box">
            <Database size={18} color="#10b981" />
            <div className="status-info">
              <div className="status-title">Vector Database</div>
              <div className="status-desc">ChromaDB — Connected</div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: History */}
      <div className="upload-card history-card">
        <div className="card-header no-border" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Lịch sử upload gần đây</h2>
          <button className="rag-btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={loadHistory}>
            <RefreshCw size={14} style={{ marginRight: 4 }} /> Làm mới
          </button>
        </div>

        {histLoading ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Đang tải...</div>
        ) : history.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Chưa có file nào được upload</div>
        ) : (
          <div className="history-list">
            {history.map(item => (
              <div className="history-item" key={item.id}>
                <div>{STATUS_ICON[item.status] || <Clock size={16} color="#94a3b8" />}</div>
                <div className="history-info-row" style={{ flex: 1 }}>
                  <div className="history-filename">{item.filename}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {item.category} · {item.chunkCount} chunks · {item.createdAt}
                  </div>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20,
                  background: item.status === 'Đã index' ? '#dcfce3' : item.status === 'Lỗi' ? '#fee2e2' : '#fef9c3',
                  color: item.status === 'Đã index' ? '#166534' : item.status === 'Lỗi' ? '#991b1b' : '#92400e',
                }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DocumentUpload;
