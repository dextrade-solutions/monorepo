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
import { ICoin } from '../../types';
import { getCoinIconByIso } from '../../utils/common';

interface SelectCoinProps {
  value: string;
  onChange: (coin: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export default function AutocompleteCoin({
  value,
  onChange,
  error = false,
  disabled = false,
}: SelectCoinProps) {
  const coinsQuery = useQuery(Currency.coins, [{ type: 'fiat' }]);

  const handleSelectChange = (_: any, newValue: string | null) => {
    if (newValue) {
      onChange(newValue);
    }
  };
  const coins = map(coinsQuery.data?.list.currentPageResult || [], 'iso');
  return (
    <Autocomplete
      fullWidth
      value={value}
      options={coins}
      disableClearable
      disabled={disabled}
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
              name={option}
              sx={{ mr: 1 }}
              url={getCoinIconByIso(option)}
              alt={`${option} icon`}
            />
            {option}
          </Box>
        );
      }}
      onChange={handleSelectChange}
      renderInput={(params) => (
        <TextField
          {...params}
          InputProps={{
            ...params.InputProps,
            disableUnderline: true,
            startAdornment: value && (
              <InputAdornment position="start">
                <UrlIcon
                  name={value}
                  url={getCoinIconByIso(value)}
                  alt={`${value} icon`}
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
