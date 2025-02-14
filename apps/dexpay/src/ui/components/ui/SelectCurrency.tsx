import { Box, Button } from '@mui/material';
import { SelectCoinsItem } from 'dex-ui';

import { useCurrencies } from '../../hooks/use-currencies';

export default function SelectCurrency({
  label = 'Select currency',
  value,
  placeholder,
  onChange,
}: {
  label?: string;
  placeholder?: string;
}) {
  const { items: currencies, isLoading } = useCurrencies();
  return (
    <Button
      sx={{
        border: 1,
        borderRadius: 0.9,
        borderColor: 'text.secondary',
        color: 'text.primary',
      }}
      variant="outlined"
      data-testid="select-currency"
    >
      <SelectCoinsItem
        value={value}
        label={label}
        loading={isLoading}
        placeholder={placeholder}
        items={currencies.map((i) => ({
          ...i.asset,
          extra: {
            currency: i.currency,
            balance: i.balance,
          },
        }))}
        onChange={onChange}
      />
    </Button>
  );
}
