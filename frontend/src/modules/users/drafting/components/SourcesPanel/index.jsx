import React from 'react';
import './SourcesPanel.css';

export default function SourcesPanel({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-panel">
      <span className="sources-label">📚 Căn cứ pháp lý được sử dụng:</span>
      <div className="sources-list">
        {sources.map((src, i) => (
          <span key={i} className="source-tag">{src}</span>
        ))}
      </div>
    </div>
  );
}
