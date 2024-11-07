import { useCallback, useEffect, useState } from 'react';

export const useRequest = (
  { queryFn, immediate = true } = { immediate: true },
) => {
  const [data, setData] = useState(null);
  const [isError, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Rest of the logic will go here
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [queryFn]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate]);

  return {
    fetchData,
    data,
    isError,
    isLoading,
  };
};
