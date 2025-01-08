import { Address } from '@multiversx/sdk-core';
import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';

import { multiversxService } from '../../../app/services/multiversx';

export default function useBalance(address: string) {
  const { data } = useQuery({
    queryKey: ['multiversxBalance', address],
    enabled: Boolean(address),
    queryFn: async () => {
      const account = new Address(address);
      const response = await multiversxService.getAccount(account);
      return BigInt(response.balance);
    },
    refetchInterval: 5 * SECOND,
  });
  return data;
}
