export const promiseWithTimeout = (
  promise: Promise<any>,
  timeout: number,
  errorMsg = 'Promise timed out',
) => {
  // Create a new promise that rejects after a specified timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMsg));
    }, timeout);
  });

  // Race between the original promise and the timeout promise
  return Promise.race([promise, timeoutPromise]);
};
