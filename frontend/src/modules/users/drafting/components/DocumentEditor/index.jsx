import React, { useEffect, useRef } from 'react';
import './DocumentEditor.css';

export default function DocumentEditor({ content, status, errorMessage }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div className="doc-editor">
      {status === 'idle' && (
        <div className="editor-placeholder">
          <span>📝</span>
          <p>Điền thông tin và nhấn "Soạn thảo" để bắt đầu...</p>
        </div>
      )}

      {status === 'loading' && (
        <div className="editor-loading">
          <div className="spinner" />
          <p>Đang tìm kiếm căn cứ pháp lý...</p>
        </div>
      )}

      {(status === 'streaming' || status === 'done') && (
        <div ref={containerRef} className="editor-content">
          <pre className="editor-text">
            {content}
            {status === 'streaming' && <span className="cursor" />}
          </pre>
        </div>
      )}

      {status === 'error' && (
        <div className="editor-error">
          <span>⚠️</span>
          <p>{errorMessage || 'Đã xảy ra lỗi, vui lòng thử lại.'}</p>
        </div>
      )}

      {status === 'done' && content && (
        <div className="editor-actions-bar">
          <button
            className="btn-secondary"
            onClick={() => navigator.clipboard.writeText(content)}
          >
            📋 Copy văn bản
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'van-ban.txt';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            📥 Tải về .TXT
          </button>
        </div>
      )}
    </div>
  );
}
