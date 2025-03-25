import {
  Autocomplete,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { getCoinIconByUid } from 'dex-helpers';
import { UrlIcon } from 'dex-ui';
import { map } from 'lodash';
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
}

export default function AutocompleteCoin({
  value: inputValue,
  onChange,
  error = false,
  disabled = false,
}: SelectCoinProps) {
  const valueId = typeof inputValue === 'number' ? inputValue : inputValue?.id;

  const coinsQuery = useQuery(Currency.coins, [{ type: 'fiat' }]);

  const handleSelectChange = (_: any, newValue: ICoin | null) => {
    if (newValue) {
      onChange(newValue);
    } else {
      onChange(null);
    }
  };
  const coins = coinsQuery.data?.list.currentPageResult || [];

  const value = coins.find((coin) => coin.id === valueId) || null;
  return (
    <Autocomplete
      fullWidth
      value={value}
      options={coins}
      disableClearable
      isOptionEqualToValue={(option, v) => option.id === v.id}
      disabled={disabled}
      getOptionLabel={(o) => o.iso}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            key={key}
            component="li"
            sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
            {...optionProps}
          >
            <UrlIcon
              name={option.iso}
              sx={{ mr: 1 }}
              url={getCoinIconByIso(option.iso)}
              alt={`${option.iso} icon`}
            />
            {option.iso}
          </Box>
        );
      }}
      onChange={handleSelectChange}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Type a coin name..."
          InputProps={{
            ...params.InputProps,
            disableUnderline: true,
            startAdornment: value && (
              <InputAdornment position="start">
                <UrlIcon
                  name={value.iso}
                  url={getCoinIconByIso(value.iso)}
                  alt={`${value.iso} icon`}
                />
              </InputAdornment>
            ),
          }}
          error={error}
          variant="standard"
        />
      )}
    />
  );
}
