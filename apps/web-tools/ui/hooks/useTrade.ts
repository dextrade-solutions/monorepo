import { useEffect, useState } from 'react';

import P2PService from '../../app/services/p2p-service';
import { useTradesActive } from '../queries/useTradesActive';

// Watch trade by id or fetch it if terminate
export function useTrade(tradeId?: string) {
  const { isLoading, data: trades } = useTradesActive();
  const [loading, setLoading] = useState(false);
  const currentTrade = (trades || []).find((t) => t.id === tradeId);
  const [trade, setTrade] = useState(currentTrade);
  useEffect(() => {
    if (currentTrade) {
      setTrade(currentTrade);
    }

    if (!currentTrade && tradeId) {
      setLoading(true);
      P2PService.exchangeById(tradeId)
        .then(({ data }) => {
          setTrade(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrade?.status, tradeId]);

  return { isLoading: isLoading || loading, trade };
}
