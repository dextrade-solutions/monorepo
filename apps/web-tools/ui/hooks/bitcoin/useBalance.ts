import { useQuery } from '@tanstack/react-query';

import { bitcoinInfo } from '../../../app/services/bitcoininfo';

export default function useBalance(address: string) {
  const { data } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const response = await bitcoinInfo.fetchAccount(address);
      const result = await response.json();
      return result;
    },
  });

  return data ? BigInt(data.final_balance) : null;
}
