import React from 'react';
import '../../styles/document.css';

function EditableText({ value, path, isEditing, onFieldChange, tag: Tag = 'p', className, style }) {
  if (!isEditing) {
    return <Tag className={className} style={{ ...style, whiteSpace: 'pre-wrap' }}>{value}</Tag>;
  }

  return (
    <Tag
      className={`${className || ''} editable-field`}
      style={{ ...style, outline: 'none', borderBottom: '1px dashed #0ea5e9', cursor: 'text', minHeight: '1em', whiteSpace: 'pre-wrap' }}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onFieldChange(path, e.target.innerText)}
    >
      {value}
    </Tag>
  );
}

function EditableTextarea({ value, path, isEditing, onFieldChange }) {
  const getInitialHtml = () => {
    if (!value) return '';
    if (value.includes('</p>') || value.includes('</div>') || value.includes('<br>')) {
      return value;
    }
    return value.split('\n').map(p => {
      const trimmed = p.trim().toUpperCase();
      if (trimmed === 'QUYẾT ĐỊNH:' || trimmed === 'QUYẾT ĐỊNH' || trimmed === 'NAY QUYẾT ĐỊNH:') {
        return `<p style="text-align: center; font-weight: bold; margin: 16px 0;">${p}</p>`;
      }
      return `<p>${p}</p>`;
    }).join('');
  };

  if (!isEditing) {
    return <div dangerouslySetInnerHTML={{ __html: getInitialHtml() }} />;
  }

  return (
    <div
      className="editable-textarea"
      contentEditable
      suppressContentEditableWarning
      style={{
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '200px',
        border: '1px dashed #0ea5e9',
        borderRadius: '4px',
        padding: '8px',
        fontFamily: 'Times New Roman, serif',
        fontSize: '14pt',
        lineHeight: '1.5',
        outline: 'none',
        background: '#fffef5',
        cursor: 'text'
      }}
      dangerouslySetInnerHTML={{ __html: getInitialHtml() }}
      onBlur={(e) => onFieldChange(path, e.target.innerHTML)}
    />
  );
}

export default function DocumentRenderer({ data, status, errorMessage, isEditing, onFieldChange }) {
  if (status === 'idle') {
    return (
      <div className="editor-placeholder" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        <span style={{ fontSize: '3rem' }}>📝</span>
        <p>Điền thông tin và nhấn "Soạn thảo" để bắt đầu...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="editor-error" style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
        <span style={{ fontSize: '3rem' }}>⚠️</span>
        <p>{errorMessage || 'Đã xảy ra lỗi, vui lòng thử lại.'}</p>
      </div>
    );
  }

  if (status === 'loading' && !data) {
    return (
      <div className="editor-loading" style={{ textAlign: 'center', padding: '40px', color: '#f59e0b' }}>
        <div className="spinner" style={{ margin: '0 auto 16px', width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p>Đang tìm kiếm căn cứ pháp lý và soạn thảo nội dung...</p>
        <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Vui lòng chờ (khoảng 15-40 giây tùy cấu hình)</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) return null;

  const isCongVan = data.ten_loai === 'CÔNG VĂN';
  const ef = onFieldChange || (() => { });

  return (
    <div className="document-wrapper">


      <div className="document-page">
        <div className="doc-header">
          <div className="doc-header-left">
            {data.ten_co_quan?.cap_tren && (
              <EditableText value={data.ten_co_quan.cap_tren} path="ten_co_quan.cap_tren"
                isEditing={isEditing} onFieldChange={ef} className="doc-co-quan-cap-tren" />
            )}
            <EditableText value={data.ten_co_quan?.chinh} path="ten_co_quan.chinh"
              isEditing={isEditing} onFieldChange={ef} className="doc-co-quan-chinh" />
            <div className="doc-duong-ke"></div>
            <EditableText value={data.so_ky_hieu} path="so_ky_hieu"
              isEditing={isEditing} onFieldChange={ef} className="doc-so-ky-hieu" />
            {isCongVan && (
              <EditableText value={data.trich_yeu} path="trich_yeu"
                isEditing={isEditing} onFieldChange={ef} style={{ margin: '8px 0 0 0', fontSize: '12pt' }} />
            )}
          </div>
          <div className="doc-header-right">
            <EditableText value={data.quoc_hieu?.dong1} path="quoc_hieu.dong1"
              isEditing={isEditing} onFieldChange={ef} className="doc-quoc-hieu" />
            <EditableText value={data.quoc_hieu?.dong2} path="quoc_hieu.dong2"
              isEditing={isEditing} onFieldChange={ef} className="doc-tieu-ngu" />
            <div className="doc-duong-ke"></div>
            <EditableText value={data.dia_danh_thoi_gian} path="dia_danh_thoi_gian"
              isEditing={isEditing} onFieldChange={ef} className="doc-dia-danh" />
          </div>
        </div>

        {!isCongVan && (
          <div className="doc-title-section">
            <EditableText value={data.ten_loai} path="ten_loai"
              isEditing={isEditing} onFieldChange={ef} className="doc-ten-loai" />
            <EditableText value={data.trich_yeu} path="trich_yeu"
              isEditing={isEditing} onFieldChange={ef} className="doc-trich-yeu" />
            <div className="doc-duong-ke-ngan"></div>
          </div>
        )}

        <div className="doc-noi-dung">
          <EditableTextarea value={data.noi_dung} path="noi_dung"
            isEditing={isEditing} onFieldChange={ef} />
        </div>

        <div className="doc-footer">
          <div className="doc-footer-left">
            <p className="doc-noi-nhan-title">Nơi nhận:</p>
            {isEditing ? (
              <textarea
                style={{
                  width: '100%', boxSizing: 'border-box', minHeight: '60px', border: '1px dashed #0ea5e9',
                  borderRadius: '4px', padding: '4px', fontSize: '11pt', outline: 'none',
                  fontFamily: 'Times New Roman, serif', background: '#fffef5',
                }}
                defaultValue={data.noi_nhan?.join('\n')}
                onBlur={(e) => ef('noi_nhan', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
              />
            ) : (
              data.noi_nhan?.map((line, i) => (
                <p key={i} className="doc-noi-nhan-line">{line}</p>
              ))
            )}
          </div>
          <div className="doc-footer-right">
            <EditableText value={data.ky_ten?.chuc_vu} path="ky_ten.chuc_vu"
              isEditing={isEditing} onFieldChange={ef} className="doc-chuc_vu" />
            <div className="doc-chu-ky-space"></div>
            <EditableText value={data.ky_ten?.ho_ten} path="ky_ten.ho_ten"
              isEditing={isEditing} onFieldChange={ef} className="doc-ho-ten" />
          </div>
        </div>
      </div>
    </div>
  );
}
