import { Card, CardContent, Box, Typography } from '@mui/material';
import {
  formatCurrency,
  formatFundsAmount,
  getCoinIconByUid,
} from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { UrlIcon } from 'dex-ui';
import React from 'react';

import { IBalance, ICurrency } from '../../types';

export function AssetListItem({
  asset,
  balance,
}: {
  asset: AssetModel;
  currency: ICurrency;
  balance?: IBalance;
}) {
  return (
    <Card elevation={0} sx={{ borderRadius: 1, bgcolor: 'secondary.dark' }}>
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
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
              : 'N/A'}
          </Typography>
          {balance?.total_balance_usdt && (
            <Typography variant="caption" color="textSecondary">
              {formatCurrency(balance.total_balance_usdt, 'USD')}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
