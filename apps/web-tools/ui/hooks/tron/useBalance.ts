import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';

import getBalance from '../../../app/helpers/tron/get-balance';

export default function useTronBalance(address: string, contract?: string, enabled: boolean = true) {
  const { data } = useQuery({
    queryKey: ['balanceTron', address, contract],
    enabled: Boolean(address) && enabled,
    queryFn: () => getBalance({ address, contract }),
    refetchInterval: 5 * SECOND,
  });
  return data;
}
