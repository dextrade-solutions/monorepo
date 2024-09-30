import { useQuery } from '@tanstack/react-query';

import { EXCHANGE_P2P_ACTIVE_STATUSES } from '../../app/constants/p2p';
import P2PService from '../../app/services/p2p-service';
import { Trade, TradeFilterModel } from '../../app/types/p2p-swaps';

const filters: TradeFilterModel = {
  includedStatuses: EXCHANGE_P2P_ACTIVE_STATUSES,
  isExchanger: false,
  orderBy: 'BY_DATE',
  sort: 'DESC',
  size: 20,
  page: 1,
};
export const QUERY_KEY = ['p2pTradesActive'];

export const useTradesActive = () =>
  useQuery<Trade[]>({
    queryKey: QUERY_KEY,
    queryFn: () =>
      P2PService.filterTrades(filters).then((response) => response.data),
  });
