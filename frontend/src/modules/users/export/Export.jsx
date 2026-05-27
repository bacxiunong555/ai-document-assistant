import React from "react";
import "./Export.css";

const Export = () => {
  const exportDocs = [
    { id: "123/CV-UBND", title: "Công văn về việc tăng cường phòng chống dịch bệnh", type: "Công văn", date: "07/04/2026", status: "Đã duyệt" },
    { id: "56/BC-UBND", title: "Báo cáo tình hình kinh tế xã hội quý I năm 2026", type: "Báo cáo", date: "04/04/2026", status: "Đã duyệt" },
    { id: "89/TB-UBND", title: "Thông báo về lịch nghỉ lễ 30/4 và 1/5", type: "Thông báo", date: "03/04/2026", status: "Đã duyệt" },
    { id: "45/QĐ-UBND", title: "Quyết định về việc bổ nhiệm cán bộ quản lý", type: "Quyết định", date: "06/04/2026", status: "Chờ duyệt", disabled: true },
  ];

  return (
    <div className="export-page">
      <header className="page-header">
        <h2>Xuất văn bản Word / PDF</h2>
        <p>Xuất văn bản sang các định dạng khác nhau</p>
      </header>

      <div className="export-grid">
        <div className="selection-panel card">
          <div className="section-header">
            <h3>📥 Chọn văn bản xuất</h3>
            <div className="header-actions">
               <label><input type="checkbox" /> Chọn tất cả (3)</label>
            </div>
          </div>

          <div className="export-items">
            {exportDocs.map((doc, i) => (
              <div key={i} className={`export-item ${doc.disabled ? 'disabled' : ''}`}>
                <input type="checkbox" disabled={doc.disabled} />
                <div className="export-info">
                  <div className="info-header">
                    <span className="doc-id">{doc.id}</span>
                    <span className={`status-tag ${doc.status === 'Đã duyệt' ? 'success' : 'muted'}`}>{doc.status}</span>
                  </div>
                  <h4>{doc.title}</h4>
                  <p className="meta">{doc.type} • 📅 {doc.date}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="panel-footer">
            Vui lòng chọn ít nhất một văn bản đã duyệt để xuất
          </div>
        </div>

        <div className="options-panel card">
          <h3>⚙️ Tùy chọn xuất</h3>
          
          <div className="option-group">
            <label>Định dạng xuất</label>
            <div className="format-list">
              <div className="format-item">
                <input type="radio" name="format" id="docx" />
                <label htmlFor="docx">
                  <strong>Microsoft Word</strong>
                  <span>.docx</span>
                </label>
              </div>
              <div className="format-item active">
                <input type="radio" name="format" id="pdf" defaultChecked />
                <label htmlFor="pdf">
                  <strong>PDF</strong>
                  <span>.pdf</span>
                </label>
              </div>
              <div className="format-item">
                <input type="radio" name="format" id="odt" />
                <label htmlFor="odt">
                  <strong>OpenDocument</strong>
                  <span>.odt</span>
                </label>
              </div>
            </div>
          </div>

          <div className="option-group">
            <label>Khổ giấy</label>
            <select>
              <option>A4 (210 x 297 mm)</option>
              <option>A3</option>
              <option>Letter</option>
            </select>
          </div>

          <div className="option-group">
             <label>Tùy chọn khác</label>
             <div className="checkbox-group">
                <label><input type="checkbox" defaultChecked /> Bao gồm chữ ký điện tử</label>
                <label><input type="checkbox" /> Thêm watermark bảo mật</label>
             </div>
          </div>

          <button className="btn-primary btn-large">📥 Tải xuống (0 văn bản)</button>
          
          <div className="action-row">
             <button className="btn-outline">🖨️ In</button>
             <button className="btn-outline">✉️ Gửi email</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;
