import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';

import getBalance from '../../../app/helpers/tron/get-balance';
import getTokenBalance from '../../../app/helpers/tron/get-token-balance';

export default function useTronBalance(address: string, contract?: string) {
  const { data } = useQuery({
    queryKey: ['balanceTron', address, contract],
    enabled: Boolean(address),
    queryFn: async () => {
      if (contract) {
        const result = await getTokenBalance(address, contract);
        return result;
      }
      const result = await getBalance(address);
      return BigInt(result || 0);
    },
    refetchInterval: 5 * SECOND,
  });
  return data;
}
