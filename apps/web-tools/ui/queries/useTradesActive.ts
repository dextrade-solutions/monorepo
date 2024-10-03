import { useQuery } from '@tanstack/react-query';
import { TRADE_ACTIVE_STATUSES } from 'dex-helpers';
import { Trade, TradeFilterModel } from 'dex-helpers/types';

import P2PService from '../../app/services/p2p-service';

const filters: TradeFilterModel = {
  includedStatuses: TRADE_ACTIVE_STATUSES,
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
