import { useEffect, useState, useCallback } from 'react';

export const useBoundingRect = (ref) => {
  const [boundingClient, setBoundingClient] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const setter = useCallback(() => {
    if (!ref || !ref.current) {
      return;
    }
    const { x, y, width, height } = ref.current.getBoundingClientRect();
    setBoundingClient({ x, y, width, height });
  }, [ref]);

  useEffect(() => {
    if (ref && ref.current) {
      setter();
    }
    window.addEventListener('resize', setter);
    return () => window.removeEventListener('resize', setter);
  }, [ref, setter]);

  return boundingClient;
};
