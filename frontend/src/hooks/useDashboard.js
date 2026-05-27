import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    documents: true,
    suggestions: true
  });
  const [error, setError] = useState(null);

  const fetchMainData = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true, documents: true }));
    setError(null);
    try {
      const [statsRes, docsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentDocuments(5)
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (docsRes.success) setRecentDocuments(docsRes.data);
    } catch (err) {
      setError('Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.');
    } finally {
      setLoading(prev => ({ ...prev, stats: false, documents: false }));
    }
  }, []);

  const fetchAiSuggestions = useCallback(async () => {
    setLoading(prev => ({ ...prev, suggestions: true }));
    try {
      const res = await dashboardService.getAiSuggestions();
      if (res.success && res.data.goi_y) {
        setAiSuggestions(res.data.goi_y);
      }
    } catch (err) {
      console.error("AI Suggestions Error:", err);
      // We don't block the UI for AI errors
    } finally {
      setLoading(prev => ({ ...prev, suggestions: false }));
    }
  }, []);

  const refresh = useCallback(() => {
    fetchMainData();
    fetchAiSuggestions();
  }, [fetchMainData, fetchAiSuggestions]);

  useEffect(() => {
    fetchMainData();
    fetchAiSuggestions();
  }, [fetchMainData, fetchAiSuggestions]);

  return {
    stats,
    recentDocuments,
    aiSuggestions,
    loading,
    error,
    refresh,
    fetchAiSuggestions
  };
}
