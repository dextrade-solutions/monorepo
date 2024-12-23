import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import { formatCurrency, formatFundsAmount, NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { bgPrimaryGradient, Icon, useGlobalModalContext } from 'dex-ui';
import React, { useState } from 'react';

import usePaymodalHandlers from '../../../hooks/usePaymodalHandlers';

const TRX_ENERGY_SAVE_FEE = 8; // currently is 8 TRX

export function SwapFees(fees: {
  superFee: boolean;
  inbound: { amount?: number; asset?: AssetModel };
  outbound: { amount?: number; asset?: AssetModel };
}) {
  const paymodalHandlers = usePaymodalHandlers();
  const { showModal } = useGlobalModalContext();
  const [expanded, setExpanded] = useState(false);
  const usdtOutbound =
    (fees.outbound.amount || 0) * (fees.outbound.asset?.priceInUsdt || 0);
  const usdtInbound =
    (fees.inbound.amount || 0) * (fees.inbound.asset?.priceInUsdt || 0);
  const total = usdtOutbound + usdtInbound;

  const reducableFeeOutbound =
    fees.superFee &&
    TRX_ENERGY_SAVE_FEE * (fees.outbound.asset?.priceInUsdt || 0);
  return (
    <Card sx={{ bgcolor: 'secondary.dark' }} variant="outlined">
      <CardActionArea onClick={() => setExpanded(!expanded)}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <Box className="flex-grow">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography>Total fee</Typography>
                  <Typography fontWeight="bold" marginRight={2}>
                    {formatCurrency(total, 'usd')}
                  </Typography>
                </Box>
                {typeof reducableFeeOutbound === 'number' && (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={1}
                  >
                    <Box display="flex" alignItems="center">
                      <Typography mr={1}>Super fee</Typography>
                      <Box display="flex" alignItems="center">
                        <Chip
                          sx={{ backgroundImage: bgPrimaryGradient }}
                          icon={<Icon name="info" />}
                          label="Activate"
                          onClick={() =>
                            showModal({
                              name: 'BUY_PLAN',
                              planId: 1,
                              paymodalHandlers,
                            })
                          }
                        ></Chip>
                      </Box>
                    </Box>
                    <Typography fontWeight="bold" marginRight={2}>
                      {formatCurrency(
                        reducableFeeOutbound + usdtInbound,
                        'usd',
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Icon
                className={classNames('arrow', {
                  'arrow-rotated': expanded,
                })}
                name="arrow-down"
                color="text.secondary"
              />
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
