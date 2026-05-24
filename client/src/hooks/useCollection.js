import { useState, useEffect, useCallback } from 'react';

/**
 * Generic reusable hook for fetching a paginated, searchable list from the API.
 * @param {Function} fetchFn  - The service function to call (e.g. getSongs)
 * @param {Object} defaultParams - Default query params (e.g. { sort: 'newest' })
 */
function useCollection(fetchFn, defaultParams = {}) {
  const [items, setItems]       = useState([]);
  const [meta, setMeta]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort]         = useState(defaultParams.sort || 'newest');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12, sort };
      if (search.trim())   params.search   = search.trim();
      if (category.trim()) params.category = category.trim();
      const response = await fetchFn(params);
      setItems(response.data || []);
      setMeta(response.meta || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, search, category, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when search/category/sort changes
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategory = useCallback((value) => {
    setCategory(value);
    setPage(1);
  }, []);

  const handleSort = useCallback((value) => {
    setSort(value);
    setPage(1);
  }, []);

  return {
    items, meta, loading, error,
    page, setPage,
    search, handleSearch,
    category, handleCategory,
    sort, handleSort,
    refetch: fetchData,
  };
}

export default useCollection;
