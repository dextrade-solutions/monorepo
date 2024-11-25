import { SECOND } from '../../../../app/constants/time';

type FetchOptions = RequestInit | undefined;

const getFetchWithThrottle = (timeout: number = 10 * SECOND, key: string) => {
  // Helper to get and set fetch times in localStorage
  const getLastFetchTimes = (): Record<string, number> => {
    const stored = localStorage.getItem('lastFetchTimes');
    return stored ? JSON.parse(stored) : {};
  };

  const setLastFetchTime = (time: number): void => {
    const lastFetchTimes = getLastFetchTimes();
    lastFetchTimes[key] = time;
    localStorage.setItem('lastFetchTimes', JSON.stringify(lastFetchTimes));
  };
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchQueues: Map<string, Promise<Response>> = new Map();

  return async function _fetch(
    url: string,
    opts?: FetchOptions,
  ): Promise<Response> {
    const now = Date.now();
    const lastFetchTimes = getLastFetchTimes();

    const currentQueue = fetchQueues.get(key) || Promise.resolve();

    const newFetch = currentQueue.then(async () => {
      // If there's a throttle period, wait for it to pass
      if (lastFetchTimes[key]) {
        const lastFetchTime = lastFetchTimes[key];
        const timeSinceLastFetch = now - lastFetchTime;

        if (timeSinceLastFetch < timeout) {
          const waitTime = timeout - timeSinceLastFetch;
          await wait(waitTime);
        }
      }

      setLastFetchTime(Date.now());

      return fetch(url, opts);
    });

    fetchQueues.set(key, newFetch);

    return newFetch.finally(() => {
      // Clean up the queue for the URL once the fetch is done
      if (fetchQueues.get(key) === newFetch) {
        fetchQueues.delete(key);
      }
    });
  };
};

export default getFetchWithThrottle;
