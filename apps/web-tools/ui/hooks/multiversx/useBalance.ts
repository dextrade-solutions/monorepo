import { Address } from '@multiversx/sdk-core';
import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';

import { multiversxService } from '../../../app/services/multiversx';

export default function useMultiversxBalance(
  address: string,
  enabled: boolean = true,
) {
  const { data } = useQuery({
    queryKey: ['multiversxBalance', address],
    queryFn: async () => {
      const account = new Address(address);
      const response = await multiversxService.getAccount(account);
      return BigInt(response.balance);
    },
    enabled: Boolean(address) && enabled,
    refetchInterval: 5 * SECOND,
  });
  return data;
}
