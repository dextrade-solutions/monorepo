import { Paper, Typography, Box, Chip } from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { sumBy } from 'lodash';
import React, { memo } from 'react';

import { useCurrencies } from '../../hooks/use-currencies';
import { CopyData, TxSendStage } from 'dex-ui';

export const Balance = memo(
  ({
    pnl,
    pnlLabel,
    children,
  }: {
    pnl?: string;
    pnlLabel?: string;
    children?: React.ReactNode;
  }) => {
    const { items } = useCurrencies();
    const totalBalance = sumBy(items, (item) => Number(item.balanceUsdt || 0));

    const numericPnl = pnl ? Number(pnl) : 0;
    const isPnlPositive = pnl !== undefined && Number(pnl) > 0;
    const isPnlNegative = pnl !== undefined && Number(pnl) < 0;

    let pnlColor;
    if (isPnlPositive) {
      pnlColor = 'success';
    }
    if (isPnlNegative) {
      pnlColor = 'error';
    }

    const pnlPercent =
      totalBalance === 0 ? 0 : (numericPnl / totalBalance) * 100;
    const formattedPnlPercent = Math.abs(pnlPercent).toFixed(2);

    return (
      <Paper elevation={0} sx={{ bgcolor: 'secondary.dark', p: 2, mb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="textSecondary">
            Balance
          </Typography>
        </Box>
        <Box pt={2} pb={3}>
          <Typography variant="h4" fontWeight="bold" color="text.tertiary">
            {formatCurrency(totalBalance, 'usd')}
          </Typography>
          {pnl !== undefined && (
            <Typography mt={1} variant="body2" color="text.secondary">
              <Chip
                label={`${isPnlPositive ? '+' : ''}${formatCurrency(pnl, 'usd')} · ${formattedPnlPercent}%`}
                size="small"
                sx={{
                  borderRadius: 0.5,
                  mr: 1,
                  bgcolor: pnlColor && `${pnlColor}.light`,
                  color: pnlColor && `${pnlColor}.contrastText`,
                  fontWeight: 'bold',
                }}
              />
              {pnlLabel}
            </Typography>
          )}
        </Box>
        {children}
      </Paper>
    );
  },
);
