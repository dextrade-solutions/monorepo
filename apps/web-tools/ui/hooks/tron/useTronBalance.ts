import { useEffect, useState } from 'react';

import getBalance from '../../../app/helpers/tron/get-balance';
import getTokenBalance from '../../../app/helpers/tron/get-token-balance';
import { tronWeb } from '../../../app/helpers/tron/tronweb';

export function useTronBalance(address: string, contract?: string) {
  const [balance, setBalance] = useState(0n);
  useEffect(() => {
    const updateBalance = async () => {
      if (!tronWeb || !address) {
        console.error('Tron wallet not connected or connection unavailable');
        return;
      }

      try {
        if (contract) {
          try {
            const result = await getTokenBalance(address, contract);
            setBalance(result);
          } catch {
            setBalance(0n);
          }
        } else {
          const result = await getBalance(address);
          setBalance(BigInt(result || 0));
        }
      } catch (error) {
        console.error('Failed to retrieve account info:', error);
      }
    };
    updateBalance();
  }, [address, contract]);
  return balance;
}
