import { useQuery } from '@tanstack/react-query';

import getBalance from '../../../app/helpers/tron/get-balance';

export default function useTronBalance(address: string, contract?: string) {
  const { data } = useQuery({
    queryKey: ['balanceTron', address, contract],
    enabled: Boolean(address),
    queryFn: () => getBalance({ address, contract }),
  });
  return data;
}
