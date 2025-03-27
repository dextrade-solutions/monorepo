import {
  Box,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { UrlIcon } from 'dex-ui';
import React from 'react';

import { useQuery } from '../../hooks/use-query';
import { Currency } from '../../services';
import { ICoin, ICurrency } from '../../types';
import { getCoinIconByIso } from '../../utils/common';

interface SelectCoinProps {
  value?: ICurrency | number | null;
  onChange: (coin: ICurrency | null) => void;
  error?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export default function SelectCoin({
  value: inputValue,
  onChange,
  error = false,
  helperText,
  disabled = false,
}: SelectCoinProps) {
  const valueId = typeof inputValue === 'number' ? inputValue : inputValue?.id;

  const coinsQuery = useQuery(Currency.coins, [{ type: 'fiat' }]);

  const handleSelectChange = (event: SelectChangeEvent<ICoin | null>) => {
    const newValue =
      coins.find((coin) => coin.id === Number(event.target.value)) || null;
    onChange(newValue);
  };
  const coins = coinsQuery.data?.list.currentPageResult || [];

  const value = coins.find((coin) => coin.id === valueId) || null;

  return (
    <FormControl fullWidth error={error} disabled={disabled} variant="standard">
      <Select
        labelId="coin-select-label"
        value={value?.id || ''}
        disableUnderline
        displayEmpty
        onChange={handleSelectChange}
        placeholder="Select coin"
        inputProps={{
          sx: {
            '&:focus': {
              backgroundColor: 'transparent',
            },
          },
        }}
      >
        {!value?.id && (
          <MenuItem value="">
            <Typography color="text.secondary">Select coin</Typography>
          </MenuItem>
        )}
        {coins.map((option) => (
          <MenuItem key={option.id} value={option.id} sx={{}}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <UrlIcon
                sx={{ mr: 1 }}
                url={getCoinIconByIso(option.iso)}
                alt={`${option.iso} icon`}
              />
              {option.iso}
            </Box>
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
