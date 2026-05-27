import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { exportService } from '../../../../services/export.service';
import { documentService } from '../../../../services/document.service';
import { generateDocx, sanitizeFilename } from '../../../../utils/docxExporter';
import DocumentRenderer from '../../drafting/components/DocumentRenderer';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { 
  Download, Settings, Calendar, FileDown, Check, FileText 
} from 'lucide-react';
import './Export.css';

const StatusLabel = {
  da_duyet: 'Đã duyệt',
  cho_duyet: 'Chờ duyệt',
  yeu_cau_sua: 'Yêu cầu sửa',
  ban_nhap: 'Bản nháp',
};

export default function ExportPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeSignature, setIncludeSignature] = useState(false);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState(null);
  const printContainerRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await exportService.getExportableDocuments();
      if (res.data) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === documents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(documents.map(d => d.id));
    }
  };

  // === PDF Export via window.print() ===
  const handlePdfExport = async () => {
    if (selectedIds.length > 1) {
      alert('Xuất PDF chỉ hỗ trợ 1 văn bản mỗi lần. Vui lòng chỉ chọn 1 văn bản.');
      return;
    }

    const docId = selectedIds[0];
    try {
      const res = await documentService.getDocumentById(docId);
      if (!res.success || !res.data?.document_data) {
        alert('Không thể tải dữ liệu văn bản');
        return;
      }

      const docData = res.data.document_data;
      const container = printContainerRef.current;
      if (!container) return;

      // Render DocumentRenderer into hidden container
      container.innerHTML = '';
      const renderDiv = document.createElement('div');
      container.appendChild(renderDiv);

      const root = createRoot(renderDiv);
      root.render(
        <DocumentRenderer data={docData} status="done" errorMessage={null} isEditing={false} />
      );

      // Wait for render
      await new Promise(r => setTimeout(r, 300));

      // Add watermark class if needed
      const docPage = container.querySelector('.document-page');
      if (docPage && includeWatermark) {
        docPage.classList.add('watermark');
      }

      // Add digital signature if needed
      if (includeSignature && docPage) {
        const sigDiv = document.createElement('div');
        sigDiv.style.cssText = 'text-align:center;font-size:9pt;color:#666;font-style:italic;margin-top:8px;';
        const now = new Date();
        sigDiv.textContent = `Ký bởi: ${docData.ky_ten?.ho_ten || ''} - ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        const footerRight = docPage.querySelector('.doc-footer-right');
        if (footerRight) footerRight.appendChild(sigDiv);
      }

      // Set document title for PDF filename
      const oldTitle = document.title;
      const fileName = sanitizeFilename(docData.so_ky_hieu, docData.trich_yeu);
      document.title = fileName;

      window.print();

      // Restore
      document.title = oldTitle;
      root.unmount();
      container.innerHTML = '';

      setToast({ type: 'success', message: 'Xuất PDF thành công!' });
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Có lỗi khi xuất PDF');
    }
  };

  // === DOCX Export ===
  const handleDocxExport = async () => {
    const options = { includeWatermark, includeSignature };
    const blobs = [];

    for (const docId of selectedIds) {
      try {
        const res = await documentService.getDocumentById(docId);
        if (!res.success || !res.data?.document_data) continue;

        const docData = res.data.document_data;
        const blob = await generateDocx(docData, options);
        const filename = sanitizeFilename(docData.so_ky_hieu, docData.trich_yeu) + '.docx';
        blobs.push({ blob, filename });
      } catch (err) {
        console.error(`Error exporting doc ${docId}:`, err);
      }
    }

    if (blobs.length === 0) {
      alert('Không thể xuất văn bản nào');
      return;
    }

    if (blobs.length === 1) {
      saveAs(blobs[0].blob, blobs[0].filename);
    } else {
      // Zip multiple files
      const zip = new JSZip();
      blobs.forEach(({ blob, filename }) => {
        zip.file(filename, blob);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'xuat_van_ban.zip');
    }

    setToast({ type: 'success', message: `Xuất thành công ${blobs.length} văn bản!` });
  };

  // === Main download handler ===
  const handleDownload = async () => {
    if (selectedIds.length === 0) return;
    setDownloading(true);
    try {
      if (exportFormat === 'pdf') {
        await handlePdfExport();
      } else {
        await handleDocxExport();
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Có lỗi khi tải xuống văn bản');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="export-container">
      <div className="export-header">
        <h1>Xuất văn bản Word / PDF</h1>
        <p>Xuất văn bản sang các định dạng khác nhau</p>
      </div>

      <div className="export-layout">
        {/* LEFT: Document list */}
        <div className="doc-list-card">
          <div className="doc-list-header">
            <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6'}}>
              <FileDown size={20} /> Chọn văn bản xuất
            </h3>
            <label className="select-all-label">
              <input
                type="checkbox"
                checked={documents.length > 0 && selectedIds.length === documents.length}
                onChange={selectAll}
              />
              Chọn tất cả ({documents.length})
            </label>
          </div>

          <div className="doc-list-body">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="export-skeleton">
                  <div className="skel-line w60"></div>
                  <div className="skel-line w80"></div>
                  <div className="skel-line w40"></div>
                </div>
              ))
            ) : documents.length > 0 ? (
              documents.map(doc => (
                <div
                  key={doc.id}
                  className={`export-doc-item ${selectedIds.includes(doc.id) ? 'selected' : ''}`}
                  onClick={() => toggleSelect(doc.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(doc.id)}
                    onChange={() => {}}
                  />
                  <div className="export-doc-info">
                    <div className="export-doc-top">
                      <span className={`export-so-hieu ${doc.so_hieu === 'Chưa có' ? 'empty' : ''}`}>
                        {doc.so_hieu}
                      </span>
                      <span className={`export-status ${doc.trang_thai}`}>
                        {StatusLabel[doc.trang_thai] || doc.trang_thai}
                      </span>
                    </div>
                    <p className="export-doc-title">{doc.tieu_de}</p>
                    <p className="export-doc-meta" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                      {doc.loai_van_ban}
                      <span>•</span>
                      <Calendar size={14} color="#9ca3af" /> {doc.ngay_tao}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                Không có văn bản nào
              </div>
            )}
          </div>

          <div className="doc-list-footer">
            Vui lòng chọn ít nhất một văn bản để xuất
          </div>
        </div>

        {/* RIGHT: Export options */}
        <div className="export-options-card">
          <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280'}}>
            <Settings size={20} /> Tùy chọn xuất
          </h3>

          {/* Format */}
          <div className="option-section">
            <span className="option-label">Định dạng xuất</span>

            <label className={`format-option ${exportFormat === 'pdf' ? 'active' : ''}`}>
              <input type="radio" name="format" value="pdf"
                checked={exportFormat === 'pdf'} onChange={() => setExportFormat('pdf')} />
              <div className="format-icon" style={{background: 'transparent', width: 'auto', height: 'auto'}}>
                <FileText size={20} color="#ef4444" />
              </div>
              <div className="format-details">
                <div className="format-name">PDF</div>
                <div className="format-desc">Định dạng PDF chính thức</div>
              </div>
              <span className="format-ext">.pdf</span>
            </label>

            <label className={`format-option ${exportFormat === 'docx' ? 'active' : ''}`}>
              <input type="radio" name="format" value="docx"
                checked={exportFormat === 'docx'} onChange={() => setExportFormat('docx')} />
              <div className="format-icon" style={{background: 'transparent', width: 'auto', height: 'auto'}}>
                <FileText size={20} color="#2563eb" />
              </div>
              <div className="format-details">
                <div className="format-name">Microsoft Word</div>
                <div className="format-desc">Định dạng văn bản có thể chỉnh sửa</div>
              </div>
              <span className="format-ext">.docx</span>
            </label>
          </div>

          {/* Extra options */}
          <div className="option-section">
            <span className="option-label">Tùy chọn khác</span>
            <label className="checkbox-option">
              <input type="checkbox" checked={includeSignature} onChange={e => setIncludeSignature(e.target.checked)} />
              Bao gồm chữ ký điện tử
            </label>
            <label className="checkbox-option">
              <input type="checkbox" checked={includeWatermark} onChange={e => setIncludeWatermark(e.target.checked)} />
              Thêm watermark bảo mật
            </label>
          </div>

          {/* Info note for PDF */}
          {exportFormat === 'pdf' && selectedIds.length > 1 && (
            <div className="export-note">
              ⚠️ PDF chỉ hỗ trợ xuất 1 văn bản mỗi lần
            </div>
          )}

          {/* Download */}
          <button className="download-btn" onClick={handleDownload} disabled={selectedIds.length === 0 || downloading} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
            <Download size={16} color="white" />
            {downloading ? 'Đang xuất...' : `Tải xuống (${selectedIds.length} văn bản)`}
          </button>
        </div>
      </div>

      {/* Hidden print container */}
      <div ref={printContainerRef} id="print-container" style={{ position: 'absolute', left: '-9999px', top: 0 }} />

      {/* Toast notification */}
      {toast && (
        <div className={`export-toast ${toast.type}`} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Check size={16} /> {toast.message}
        </div>
      )}
    </div>
  );
}
