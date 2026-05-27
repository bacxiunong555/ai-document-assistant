import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { documentService } from '../services/document.service';

export function useDocumentSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialQ = searchParams.get('q') || '';
  const initialLoai = searchParams.get('loai') || '';
  const initialTrangThai = searchParams.get('trang_thai') || '';
  const initialPage = parseInt(searchParams.get('page')) || 1;

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({ q: initialQ, loai: initialLoai, trang_thai: initialTrangThai });
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ loai_van_ban: [], trang_thai: [] });

  const debounceTimer = useRef(null);

  const fetchOptions = async () => {
    try {
      const res = await documentService.getFilterOptions();
      if (res.success) {
        setFilterOptions(res.data);
      }
    } catch (err) {
      console.error("Filter options error", err);
    }
  };

  const updateUrlParams = (currentFilters, currentPage) => {
    const params = new URLSearchParams();
    if (currentFilters.q) params.set('q', currentFilters.q);
    if (currentFilters.loai) params.set('loai', currentFilters.loai);
    if (currentFilters.trang_thai) params.set('trang_thai', currentFilters.trang_thai);
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params, { replace: true });
  };

  const search = useCallback(async (currentFilters = filters, currentPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...currentFilters, page: currentPage, limit };
      const res = await documentService.searchDocuments(params);
      if (res.success) {
        setResults(res.data.items);
        setTotal(res.data.total);
        setPage(res.data.page);
        setSelectedIds([]);
        updateUrlParams(currentFilters, res.data.page);
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách văn bản');
    } finally {
      setLoading(false);
    }
  }, [limit, setSearchParams]);

  useEffect(() => {
    fetchOptions();
    search(filters, page);
    // eslint-disable-next-line
  }, []);

  const changePage = (newPage) => {
    setPage(newPage);
    search(filters, newPage);
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    if (key === 'q') {
      debounceTimer.current = setTimeout(() => {
        search(newFilters, 1);
      }, 500);
    } else {
      search(newFilters, 1);
    }
  };

  const resetFilters = () => {
    const emptyFilters = { q: '', loai: '', trang_thai: '' };
    setFilters(emptyFilters);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    search(emptyFilters, 1);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === results.length && results.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(results.map(r => r.id));
    }
  };

  const deleteSelected = async () => {
    try {
      for (const id of selectedIds) {
        await documentService.deleteDocument(id);
      }
      setSelectedIds([]);
      search(filters, page);
    } catch (err) {
      console.error("Delete error", err);
      alert("Có lỗi xảy ra khi xóa văn bản");
    }
  };
  
  const deleteSingle = async (id) => {
    try {
      await documentService.deleteDocument(id);
      setSelectedIds(prev => prev.filter(x => x !== id));
      search(filters, page);
    } catch (err) {
      console.error("Delete error", err);
      alert("Có lỗi xảy ra khi xóa văn bản");
    }
  }

  return {
    results,
    total,
    loading,
    error,
    page,
    limit,
    filters,
    selectedIds,
    filterOptions,
    search,
    changePage,
    updateFilter,
    resetFilters,
    toggleSelect,
    selectAll,
    deleteSelected,
    deleteSingle
  };
}
