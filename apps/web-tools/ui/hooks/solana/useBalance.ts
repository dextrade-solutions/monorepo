import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';

import { getAssociatedTokenAccount } from '../../../app/helpers/solana/get-associated-token-account';

export default function useSolanaBalance(address: string, contract?: string) {
  const { connection } = useConnection();

  const { data } = useQuery({
    queryKey: ['useSolanaBalance', address, contract],
    enabled: Boolean(address),
    queryFn: async () => {
      if (!connection || !address) {
        throw new Error('Wallet not connected or connection unavailable');
      }
      const publicKey = new PublicKey(address);

      if (contract) {
        const associatedAccount = await getAssociatedTokenAccount(
          connection,
          new PublicKey(contract),
          publicKey,
        );
        return associatedAccount.amount;
      }
      const accountInfo = await connection.getAccountInfo(publicKey);
      return BigInt(accountInfo?.lamports || 0);
    },
    refetchInterval: 5 * SECOND,
  });
  return data;
}
