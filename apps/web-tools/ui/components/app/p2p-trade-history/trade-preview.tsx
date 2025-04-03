import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Typography,
} from '@mui/material';
import {
  formatCurrency,
  formatFundsAmount,
  relativeFromCurrentDate,
  TRADE_ACTIVE_STATUSES,
} from 'dex-helpers';
import { Trade } from 'dex-helpers/types';
import { AssetItem, Icon, useGlobalModalContext } from 'dex-ui';
import { useNavigate } from 'react-router-dom';

import { AWAITING_SWAP_ROUTE } from '../../../helpers/constants/routes';
import P2PDisplayStatus from '../p2p-display-status';

export function TradePreview({ trade }: { trade: Trade }) {
  const navigate = useNavigate();
  const { showModal } = useGlobalModalContext();

  const openTradeHistory = () => {
    if (TRADE_ACTIVE_STATUSES.includes(trade.status)) {
      navigate(`${AWAITING_SWAP_ROUTE}/${trade.id}`);
    } else {
      showModal({
        name: 'TRADE_HISTORY_ROW',
        trade,
      });
    }
  };
  return (
    <Card
      variant="outlined"
      sx={{ bgcolor: 'primary.light' }}
      onClick={openTradeHistory}
    >
      <CardActionArea>
        <CardContent>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <AssetItem coin={trade.exchangerSettings.from} />
              <Icon name="exchange-direction" size="xl" />
              <AssetItem coin={trade.exchangerSettings.to} alignReverse />
            </Box>

            <Box textAlign="right">
              <Typography color="primary">
                +{' '}
                {formatCurrency(
                  trade.exchangerSentAmount || trade.amount2,
                  trade.exchangerSettings.to.ticker,
                )}
              </Typography>
              <Typography>
                -{' '}
                {formatCurrency(
                  trade.amount1,
                  trade.exchangerSettings.from.ticker,
                )}
              </Typography>
            </Box>
          </Box>
          <Box marginY={3} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">
              {relativeFromCurrentDate(trade.cdt)}
            </Typography>
            <P2PDisplayStatus status={trade.status} />
          </Box>
        </CardContent>
        {trade.unread > 0 && (
          <CardContent>
            <Divider />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              marginTop={2}
            >
              <Typography variant="body2">Unread messages</Typography>
              <Chip label={trade.unread} color="primary" />
            </Box>
          </CardContent>
        )}
      </CardActionArea>
    </Card>
  );
}
