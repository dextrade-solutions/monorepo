import { Box } from '@mui/material';
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
  const { items: currencies, isLoading } = useCurrencies({
    allCoins: true,
  });
  return (
    <Box>
      <SelectCoinsItem
        value={value}
        label={label}
        loading={isLoading}
        placeholder={placeholder}
        items={currencies.map((i) => i.asset)}
        onChange={onChange}
      />
    </Box>
  );
}
