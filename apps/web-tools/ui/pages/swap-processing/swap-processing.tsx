import { Box } from '@mui/material';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { parseCoin } from '../../../app/helpers/p2p';
import P2PSwapProcessing from '../../components/app/p2p-swap-processing';
import { useTrade } from '../../hooks/useTrade';

export const SwapProcessing = () => {
  const { id } = useParams();

  const { isLoading, trade } = useTrade(id);

  const fromAsset = useMemo(
    () =>
      trade &&
      parseCoin(
        trade.exchangerSettings.from,
        trade.exchangerSettings.coinPair.priceCoin1InUsdt,
      ),
    [trade],
  );
  const toAsset = useMemo(
    () =>
      trade &&
      parseCoin(
        trade.exchangerSettings.to,
        trade.exchangerSettings.coinPair.priceCoin2InUsdt,
      ),
    [trade],
  );

  if (trade && fromAsset && toAsset) {
    return <P2PSwapProcessing exchange={trade} from={fromAsset} to={toAsset} />;
  }

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (!trade) {
    return <Box>Trade with id {id} was not found</Box>;
  }

  if (!fromAsset) {
    return (
      <Box>Coin {trade.exchangerSettings.from.ticker} is not supported</Box>
    );
  } else if (!toAsset) {
    return <Box>Coin {trade.exchangerSettings.to.ticker} is not supported</Box>;
  }

  return null;
};
