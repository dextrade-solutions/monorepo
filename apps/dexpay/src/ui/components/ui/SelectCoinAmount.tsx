import { Box, InputAdornment, FormControl, Input } from '@mui/material';
import { withValidationProvider } from 'dex-ui';
import React from 'react';

import AutocompleteCoin from './AutocompleteCoin';
import { ICoin } from '../../types';

type InputValue = {
  amount: string | number | null;
  coin: string;
};

function SelectCoinAmount({
  value,
  error,
  onChange,
}: {
  value: InputValue;
  error: boolean;
  isLoading: boolean;
  coins: Record<string, ICoin>;
  onChange: (v: InputValue) => void;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      amount: e.target.value,
      coin: value.coin,
    });
  };

  const handleSelectChange = (v) => {
    onChange({
      amount: value.amount,
      coin: v,
    });
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <FormControl
        sx={{
          width: '100%',
          p: 2,
          border: 1,
          borderRadius: 1,
          borderColor: 'tertiary.light',
        }}
        variant="standard"
        data-testid="select-coin-amount"
      >
        <Input
          value={value?.amount}
          id="input-with-icon-adornment"
          type="number"
          placeholder="0"
          error={error}
          disableUnderline
          sx={{
            padding: 0,
            overflow: 'hidden',
          }}
          onChange={handleInputChange}
          endAdornment={
            <InputAdornment sx={{ width: 200, pr: 1 }} position="end">
              <AutocompleteCoin
                value={value.coin}
                onChange={handleSelectChange}
              />
            </InputAdornment>
          }
        />
      </FormControl>
    </Box>
  );
}

export default withValidationProvider(SelectCoinAmount);
