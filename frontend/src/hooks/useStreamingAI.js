import { useState, useRef } from 'react';
import { DRAFT_STREAM_URL } from '../services/drafting.service';

export function useStreamingAI() {
  const [content, setContent] = useState('');
  const [sources, setSources] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const abortControllerRef = useRef(null);

  const cancelStream = () => {
    abortControllerRef.current?.abort();
    setStatus('idle');
  };

  const resetStream = () => {
    cancelStream();
    setContent('');
    setSources([]);
    setErrorMessage(null);
    setStatus('idle');
  };

  const startStream = async (payload) => {
    if (status === 'loading' || status === 'streaming') {
      abortControllerRef.current?.abort();
    }

    setContent('');
    setSources([]);
    setErrorMessage(null);
    setStatus('loading');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(DRAFT_STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      setStatus('streaming');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          console.log("SSE Line:", line);
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'meta') {
              setSources(event.sources || []);
            } else if (event.type === 'token') {
              setContent(prev => prev + event.token);
            } else if (event.type === 'done') {
              setStatus('done');
            } else if (event.type === 'error') {
              setStatus('error');
              setErrorMessage(event.message);
            }
          } catch (e) {
            console.error("JSON Parse Error on line:", line, e);
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return { content, sources, status, errorMessage, startStream, cancelStream, resetStream };
}
