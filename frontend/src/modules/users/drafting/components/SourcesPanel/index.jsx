import React from 'react';
import './SourcesPanel.css';

const labelByType = {
  same_doc_type: 'Đúng loại',
  general: 'Tổng hợp',
};

const formatScore = (score) => {
  if (typeof score !== 'number') return '';
  return score.toFixed(3);
};

export default function SourcesPanel({ sources, references }) {
  const hasSourceField = Array.isArray(sources);
  const hasReferenceField = Array.isArray(references);
  const hasReferences = references && references.length > 0;
  const hasSources = sources && sources.length > 0;

  return (
    <div className="sources-panel">
      <div className="sources-summary">
        <span className="sources-label">Căn cứ RAG được sử dụng:</span>
        <div className="sources-list">
          {hasSources ? (
            sources.map((src, i) => (
              <span key={i} className="source-tag">{src}</span>
            ))
          ) : hasSourceField || hasReferenceField ? (
            <span className="source-empty">
              RAG không trả về nguồn phù hợp cho truy vấn này.
            </span>
          ) : (
            <span className="source-empty">
              Chưa có metadata nguồn trong response. Hãy restart backend rồi soạn lại.
            </span>
          )}
        </div>
      </div>

      {hasReferences && (
        <div className="source-reference-list">
          {references.map((ref, i) => (
            <details key={`${ref.source}-${ref.rank}-${i}`} className="source-reference-item">
              <summary>
                <span className="source-rank">#{ref.rank || i + 1}</span>
                <span className="source-name">{ref.source || ref.filename || 'Không rõ nguồn'}</span>
                {ref.doc_type && <span className="source-meta">{ref.doc_type}</span>}
                {ref.match_type && <span className="source-meta">{labelByType[ref.match_type] || ref.match_type}</span>}
                {formatScore(ref.score) && <span className="source-score">score {formatScore(ref.score)}</span>}
              </summary>
              {ref.excerpt && <p className="source-excerpt">{ref.excerpt}</p>}
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
