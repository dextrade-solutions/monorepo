import { useQuery } from '@tanstack/react-query';

import { bitcoinInfo } from '../../../app/services/bitcoininfo';

export default function useBalance(address: string) {
  const { data } = useQuery({
    queryKey: ['paymentMethods', address],
    enabled: Boolean(address),
    queryFn: async () => {
      const response = await bitcoinInfo.fetchAccount(address);
      const result = await response.json();
      console.log(result);
      return result;
    },
  });

  return data?.final_balance ? BigInt(data.final_balance) : null;
}
