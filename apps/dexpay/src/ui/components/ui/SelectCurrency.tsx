import { Box, Button, Typography } from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { AssetItem, useGlobalModalContext } from 'dex-ui';
import React from 'react';

import { useCurrencies } from '../../hooks/use-currencies';

export default function SelectCurrency({
  value,
  reversed,
  title,
  placeholder = 'Select currency',
  noZeroBalances,
  onChange,
  variant,
  ...rest
}: {
  value: AssetModel;
  title?: string;
  noZeroBalances?: boolean;
  reversed?: boolean;
  variant?: string;
  placeholder?: string;
  onChange: (v: AssetModel) => void;
}) {
  const { showModal } = useGlobalModalContext();
  const { items, isLoading } = useCurrencies();
  const onClick = () => {
    showModal({
      name: 'ASSET_SELECT',
      title,
      value,
      items: items
        .map((i) => ({
          ...i.asset,
          balance: i.balance?.total_balance_currency,
          balanceUsdt: i.balance?.total_balance_usdt,
          currency: i.currency,
        }))
        .filter((i) => (noZeroBalances ? i.balance : true)),
      onChange,
      loading: isLoading,
      maxListItem: 6,
    });
  };

  return (
    <Button
      disabled={isLoading}
      data-testid="select-currency"
      onClick={onClick}
      variant={value ? 'text' : variant}
      {...rest}
    >
      {value && (
        <Box>
          <AssetItem
            alignReverse={reversed}
            asset={value}
            subtitle={
              value.balance && (
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(value.balanceUsdt, 'usd')}
                </Typography>
              )
            }
          />
        </Box>
      )}
      {!value && placeholder}
    </Button>
  );
}
