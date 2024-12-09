import { useQuery } from '@tanstack/react-query';

import { multiversxService } from '../../../app/services/multiversx';

export default function useBalance(address: string) {
  const { data } = useQuery({
    queryKey: ['multiversxBalance', address],
    queryFn: async () => {
      const response = await multiversxService.getBalance(address);
      return BigInt(response.data.data.balance);
    },
  });
  return data;
}
