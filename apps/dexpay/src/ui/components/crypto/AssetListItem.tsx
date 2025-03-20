import { Card, CardContent, Box, Typography, Paper } from '@mui/material';
import {
  formatCurrency,
  formatFundsAmount,
  getCoinIconByUid,
} from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { UrlIcon } from 'dex-ui';
import React from 'react';
import { useHashLocation } from 'wouter/use-hash-location';

import { ROUTE_WALLET_DEPOSIT } from '../../constants/pages';
import { IBalance, ICurrency } from '../../types';

export function AssetListItem({
  asset,
  balance,
}: {
  asset: AssetModel;
  currency: ICurrency;
  balance?: IBalance;
}) {
  const [, navigate] = useHashLocation();

  const openDeposit = () => {
    navigate(`${ROUTE_WALLET_DEPOSIT}/${asset.iso}`);
  };
  return (
    <Paper
      elevation={0}
      sx={{
        color: 'text.secondary',
        borderRadius: 0.5,
        bgcolor: 'secondary.dark',
      }}
      onClick={openDeposit}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <UrlIcon size={40} url={getCoinIconByUid(asset.uid)} />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {asset.symbol}
            </Typography>
            {asset.standard && (
              <Typography color="text.secondary">
                {asset.standard.toUpperCase()}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography>
            {balance?.total_balance_currency
              ? formatFundsAmount(balance.total_balance_currency)
              : '0'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {formatCurrency(balance?.total_balance_usdt || '0', 'USD')}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
