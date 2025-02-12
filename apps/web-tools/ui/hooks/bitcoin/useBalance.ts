import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';

import { bitcoinInfo } from '../../../app/services/bitcoininfo';

export default function useBalance(address: string) {
  const { data } = useQuery({
    queryKey: ['paymentMethods', address],
    enabled: Boolean(address),
    queryFn: async () => {
      const response = await bitcoinInfo.fetchAccount(address);
      const result = await response.json();
      return result;
    },
    refetchInterval: 30 * SECOND,
  });

  return typeof data?.final_balance === 'number'
    ? BigInt(data.final_balance)
    : null;
}
