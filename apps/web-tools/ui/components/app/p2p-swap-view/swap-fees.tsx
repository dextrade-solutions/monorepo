import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Collapse,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import { formatCurrency, formatFundsAmount } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { Icon } from 'dex-ui';
import { useState } from 'react';

export function SwapFees(fees: {
  inbound: { amount?: number; asset?: AssetModel };
  outbound: { amount?: number; asset?: AssetModel };
}) {
  const [expanded, setExpanded] = useState(false);
  const usdtInbound =
    (fees.inbound.amount || 0) * (fees.inbound.asset?.priceInUsdt || 0);
  const usdtOutbound =
    (fees.outbound.amount || 0) * (fees.outbound.asset?.priceInUsdt || 0);
  const total = usdtOutbound + usdtInbound;

  return (
    <Card sx={{ bgcolor: 'secondary.dark' }} variant="outlined">
      <CardActionArea onClick={() => setExpanded(!expanded)}>
        <CardHeader
          sx={{ height: 50 }}
          title={
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography>Total fee</Typography>
              </Box>
              <Box display="flex">
                <Typography fontWeight="bold" marginRight={2}>
                  {formatCurrency(total, 'usd')}
                </Typography>
                <Icon
                  className={classNames('arrow', { 'arrow-rotated': expanded })}
                  name="arrow-down"
                  color="text.secondary"
                />
              </Box>
            </Box>
          }
        />
      </CardActionArea>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {fees.outbound.asset && fees.outbound.amount !== undefined && (
            <Box display="flex" justifyContent="space-between" marginTop={1}>
              <Typography>
                {fees.outbound.asset.isFiat
                  ? 'Exchanger fee'
                  : 'Network outbound'}
              </Typography>
              <Box display="flex">
                <Typography>
                  {formatFundsAmount(
                    fees.outbound.amount,
                    fees.outbound.asset.symbol,
                  )}
                </Typography>
                {fees.outbound.asset.priceInUsdt && (
                  <Typography color="text.secondary" marginLeft={1}>
                    {formatCurrency(
                      fees.outbound.amount * fees.outbound.asset.priceInUsdt,
                      'usd',
                    )}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          {fees.inbound.asset && fees.inbound.amount !== undefined && (
            <Box display="flex" justifyContent="space-between" marginTop={1}>
              <Typography>
                {fees.inbound.asset.isFiat
                  ? 'Exchanger fee'
                  : 'Network inbound'}
              </Typography>
              <Box display="flex">
                <Typography>
                  {formatFundsAmount(
                    fees.inbound.amount,
                    fees.inbound.asset.symbol,
                  )}
                </Typography>
                {fees.inbound.asset.priceInUsdt && (
                  <Typography color="text.secondary" marginLeft={1}>
                    {formatCurrency(
                      fees.inbound.amount * fees.inbound.asset.priceInUsdt,
                      'usd',
                    )}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
