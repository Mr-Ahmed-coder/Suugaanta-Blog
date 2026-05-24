import { useEffect, useState } from "react";

function useResourceDetail(fetchFn, identifier) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchFn(identifier);

        if (isMounted) {
          setItem(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "This archive item could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (identifier) {
      fetchItem();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchFn, identifier]);

  return { item, loading, error };
}

export default useResourceDetail;
