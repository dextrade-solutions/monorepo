import copyToClipboard from 'copy-to-clipboard';
import { useState, useCallback } from 'react';

import { useTimeout } from './useTimeout';

/**
 * useCopyToClipboard
 * @param {number} [delay=3000] - delay in ms
 * @returns {[boolean, Function]}
 */
const DEFAULT_DELAY = 3000;

export function useCopyToClipboard(delay = DEFAULT_DELAY) {
  const [copied, setCopied] = useState(false);
  const startTimeout = useTimeout(
    () => {
      setCopied(false);
    },
    delay,
    false,
  );

  const handleCopy = useCallback(
    (text) => {
      setCopied(true);
      startTimeout();
      copyToClipboard(text);
    },
    [startTimeout],
  );

  return [copied, handleCopy];
}
