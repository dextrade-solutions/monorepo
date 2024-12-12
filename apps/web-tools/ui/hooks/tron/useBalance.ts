import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import getBalance from '../../../app/helpers/tron/get-balance';
import getTokenBalance from '../../../app/helpers/tron/get-token-balance';
import { tronWeb } from '../../../app/helpers/tron/tronweb';

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
  });
  return data;
}
