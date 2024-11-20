import { useEffect, useState } from 'react';
import Wallet from 'sats-connect';

export default function useBalance(address: string) {
  const [balance, setBalance] = useState(0n);

  useEffect(() => {
    const updateBalance = async () => {
      try {
        const response = await Wallet.request('getBalance', undefined);
        if (response.status === 'success') {
          setBalance(BigInt(response.result.confirmed));
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Failed to retrieve account info:', error);
      }
    };

    updateBalance();
  }, [address]);
  return balance;
}
