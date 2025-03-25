import { Box, Button, Typography } from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import { AssetItem, useGlobalModalContext } from 'dex-ui';
import React, { useEffect, useState } from 'react';

import { useCurrencies } from '../../hooks/use-currencies';
import { CurrencyModel } from '../../types';

export default function SelectCurrency({
  value,
  initialValueIso,
  reversed,
  title,
  placeholder = 'Select currency',
  noZeroBalances,
  onChange,
  currencies,
  variant,
  ...rest
}: {
  currencies?: {
    items: CurrencyModel[];
    isLoading: boolean;
  };
  value: CurrencyModel;
  title?: string;
  noZeroBalances?: boolean;
  reversed?: boolean;
  variant?: string;
  placeholder?: string;
  initialValueIso?: string;
  onChange: (v: CurrencyModel) => void;
}) {
  const [initialized, setInitialized] = useState(false);
  const { showModal } = useGlobalModalContext();
  const useCurrenciesHookWrap = () => {
    return currencies ? () => currencies : useCurrencies;
  };
  const { items: initialItems, isLoading } = useCurrenciesHookWrap()();

  const items = initialItems.filter((i) => (noZeroBalances ? i.balance : true));

  useEffect(() => {
    if (initialValueIso && items.length && !initialized) {
      const result = items.find((i) => i.iso === initialValueIso);
      result && onChange(result);
      setInitialized(true);
    }
  }, [initialValueIso, items, initialized, onChange]);

  const onClick = () => {
    showModal({
      name: 'ASSET_SELECT',
      title,
      value,
      items,
      loading: isLoading,
      maxListItem: 6,
      onChange,
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
              value.balanceUsdt && (
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
