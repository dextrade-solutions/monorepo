import { useInfiniteQuery } from '@tanstack/react-query';

import P2PService from '../../app/services/p2p-service';
import { Trade } from '../../app/types/p2p-swaps';

export const QUERY_KEY = [
  'p2pTrades',
  {
    isExchanger: false,
    orderBy: 'BY_DATE',
    sort: 'DESC',
    size: 10,
  },
];

export const useTrades = () =>
  useInfiniteQuery<Trade[]>({
    queryKey: QUERY_KEY,
    queryFn: ({ pageParam, queryKey }) =>
      P2PService.filterTrades({
        page: pageParam as number,
        ...queryKey[1],
      }).then((response) => response.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length + 1 : null;
    },
  });
