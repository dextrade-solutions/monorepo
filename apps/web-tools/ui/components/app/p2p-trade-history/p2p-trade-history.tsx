import { Box, Divider, Typography } from '@mui/material';
import { flatMap, groupBy } from 'lodash';
import { InView } from 'react-intersection-observer';

import { TradePreview } from './trade-preview';
import { useTrades } from '../../../queries/useTrades';
import { useTradesActive } from '../../../queries/useTradesActive';

export const P2PTradeHistory = () => {
  const { isLoading: isLoadingTradesActive, data: tradesActive = [] } =
    useTradesActive();
  const { isFetching, isLoading, fetchNextPage, data } = useTrades();

  if (isLoading || isLoadingTradesActive) {
    return <Box>Loading...</Box>;
  }
  const allTrades = flatMap(data?.pages);
  const activeTradesById = groupBy(tradesActive, ({ id }) => id);
  const tradesTerminal = allTrades.filter((t) => !activeTradesById[t.id]);

  if (allTrades.length > 0) {
    return (
      <Box>
        {tradesActive.length > 0 && (
          <Box>
            <Typography marginLeft={2} fontWeight="bold" variant="h6">
              Pending ({tradesActive.length})
            </Typography>
            <Box marginY={1}>
              <Divider />
            </Box>
            {tradesActive.map((trade) => (
              <Box marginY={2} key={trade.id}>
                <TradePreview trade={trade} />
              </Box>
            ))}
          </Box>
        )}
        {tradesTerminal.length > 0 && (
          <Box>
            <Typography marginLeft={2} variant="h6">
              History
            </Typography>
            <Box marginY={1}>
              <Divider />
            </Box>
            {tradesTerminal.map((trade) => (
              <Box marginY={2} key={trade.id}>
                <TradePreview trade={trade} />
              </Box>
            ))}
          </Box>
        )}
        <InView
          as="div"
          onChange={(inView) => {
            if (inView && !isLoading && !isFetching) {
              fetchNextPage();
            }
          }}
        ></InView>
      </Box>
    );
  }
  return <Box>Trades not found...</Box>;
};
