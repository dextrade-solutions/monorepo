import { Card, CardContent, Box, Typography } from '@mui/material';
import { getCoinIconByUid } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { UrlIcon } from 'dex-ui';
import React from 'react';

import { IBalance, ICurrency } from '../../types';

export function AssetListItem({
  asset,
  currency, // Include the currency prop
  balance,
}: {
  asset: AssetModel;
  currency: ICurrency;
  balance?: IBalance;
}) {
  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, bgcolor: 'secondary.dark' }}>
      {/* Improved card styling */}
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
          {' '}
          {/* Added a right-aligned box for balance */}
          <Typography variant="body2" color="textSecondary">
            {/* Display balance with proper formatting or fallback */}
            {balance?.amount ? balance.amount : 'N/A'}
          </Typography>
          {/* Conditionally render USD value if available */}
          {balance?.usdValue && (
            <Typography variant="caption" color="textSecondary">
              ${balance.usdValue.toFixed(2)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
