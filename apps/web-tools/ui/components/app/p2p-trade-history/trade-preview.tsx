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
  formatFundsAmount,
  relativeFromCurrentDate,
  TRADE_ACTIVE_STATUSES,
} from 'dex-helpers';
import { Trade } from 'dex-helpers/types';
import { Icon } from 'dex-ui';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { showModal } from '../../../ducks/app/app';
import { AWAITING_SWAP_ROUTE } from '../../../helpers/constants/routes';
import AssetItem from '../../ui/asset-item';
import P2PDisplayStatus from '../p2p-display-status';

export function TradePreview({ trade }: { trade: Trade }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const openTradeHistory = () => {
    if (TRADE_ACTIVE_STATUSES.includes(trade.status)) {
      navigate(`${AWAITING_SWAP_ROUTE}/${trade.id}`);
    } else {
      dispatch(
        showModal({
          name: 'TRADE_HISTORY_ROW',
          trade,
        }),
      );
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
                {formatFundsAmount(
                  trade.amount2,
                  trade.exchangerSettings.to.ticker,
                )}
              </Typography>
              <Typography>
                -{' '}
                {formatFundsAmount(
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
