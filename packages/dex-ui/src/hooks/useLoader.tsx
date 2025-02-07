import { useLoaderContext } from '../contexts/loader';
import { useCallback } from 'react';

export const useLoader = () => {
  const { isLoading, setLoading } = useLoaderContext();

  const runLoader = useCallback(
    (promise: Promise<any>) => {
      setLoading(true);
      return promise.finally(() => setLoading(false));
    },
    [setLoading],
  );

  return {
    isLoading,
    setLoading,
    runLoader,
  };
};
