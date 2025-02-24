import { Box, Button } from '@mui/material';
import { AssetModel } from 'dex-helpers/types';
import { AssetItem, useGlobalModalContext } from 'dex-ui';
import React from 'react';

import { useCurrencies } from '../../hooks/use-currencies';

export default function SelectCurrency({
  value,
  reversed,
  placeholder = 'Select currency',
  onChange,
  variant,
  ...rest
}: {
  value: AssetModel;
  label?: string;
  variant?: string;
  placeholder?: string;
}) {
  const { showModal } = useGlobalModalContext();
  const { items, isLoading } = useCurrencies();
  const onClick = () => {
    showModal({
      name: 'ASSET_SELECT',
      value,
      items: items.map((i) => ({
        ...i.asset,
        balance: i.balance?.total_balance_currency,
        balanceUsdt: i.balance?.total_balance_usdt,
        currency: i.currency,
      })),
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
      {value && <AssetItem alignReverse={reversed} asset={value} />}
      {!value && placeholder}
    </Button>
  );
}
