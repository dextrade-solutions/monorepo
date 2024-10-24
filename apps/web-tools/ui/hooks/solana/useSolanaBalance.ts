import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import { getAssociatedTokenAccount } from '../../../app/helpers/solana/get-associated-token-account';

export default function useSolanaBalance(address: string, contract?: string) {
  const [balance, setBalance] = useState(0n);
  const { connection } = useConnection();

  useEffect(() => {
    const updateBalance = async () => {
      if (!connection || !address) {
        console.error('Wallet not connected or connection unavailable');
        return;
      }
      const publicKey = new PublicKey(address);

      try {
        if (contract) {
          try {
            const associatedAccount = await getAssociatedTokenAccount(
              connection,
              new PublicKey(contract),
              publicKey,
            );
            setBalance(associatedAccount.amount);
          } catch {
            setBalance(0n);
          }
        } else {
          const accountInfo = await connection.getAccountInfo(publicKey);
          setBalance(BigInt(accountInfo?.lamports || 0));
        }
      } catch (error) {
        console.error('Failed to retrieve account info:', error);
      }
    };

    updateBalance();
  }, [connection, address, contract]);
  return balance;
}
