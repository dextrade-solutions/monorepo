import { Box, Button, Divider, Skeleton, Typography } from '@mui/material';
import { Icon } from 'dex-ui';
import { flatMap, groupBy } from 'lodash';
import { InView } from 'react-intersection-observer';

import { TradePreview } from './trade-preview';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTrades } from '../../../queries/useTrades';
import { useTradesActive } from '../../../queries/useTradesActive';

export const P2PTradeHistory = ({ onBack }: { onBack: () => void }) => {
  const t = useI18nContext();

  const { isLoading: isLoadingTradesActive, data: tradesActive = [] } =
    useTradesActive();
  const { isFetching, isLoading, fetchNextPage, data } = useTrades();

  if (isLoading || isLoadingTradesActive) {
    return (
      <Box>
        <Skeleton height={100} />
        <Skeleton height={100} />
        <Skeleton height={100} />
      </Box>
    );
  }
  const allTrades = flatMap(data?.pages);
  const activeTradesById = groupBy(tradesActive, ({ id }) => id);
  const tradesTerminal = allTrades.filter((t) => !activeTradesById[t.id]);

  const backbutton = (
    <Button
      sx={{ color: 'text.primary' }}
      startIcon={<Icon name="arrow-left-dex" />}
      onClick={onBack}
    >
      {t('back')}
    </Button>
  );

  if (allTrades.length > 0) {
    return (
      <Box>
        {tradesActive.length > 0 && (
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              padding={1}
            >
              <Typography fontWeight="bold" variant="h6">
                Pending ({tradesActive.length})
              </Typography>
              {backbutton}
            </Box>
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
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              padding={1}
            >
              <Typography variant="h6">History</Typography>
              {tradesActive.length === 0 && backbutton}
            </Box>
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
  return (
    <Box display="flex" alignContent="center">
      <Typography color="text.secondary">Trades not found...</Typography>
      <div className="flex-grow" />
      {backbutton}
    </Box>
  );
};
