import {
  Box,
  TextField,
  Skeleton,
  Autocomplete,
  InputAdornment,
  FormControl,
  InputLabel,
  Input,
  OutlinedInput,
  StepLabel,
  FormLabel,
} from '@mui/material';
import { getCoinIconByUid } from 'dex-helpers';
import { UrlIcon, withValidationProvider } from 'dex-ui';
import React from 'react';

import { useQuery } from '../../hooks/use-query';
import { Currency } from '../../services';
import { ICoin } from '../../types';

type InputValue = {
  amount: string | number | null;
  coin: string;
};

function SelectCoinAmount({
  value,
  error,
  isLoading,
  coins,
  onChange,
}: {
  value: InputValue;
  error: boolean;
  isLoading: boolean;
  coins: Record<string, ICoin>;
  onChange: (v: InputValue) => void;
}) {
  const preloader = () => {
    return (
      <Box>
        <Skeleton width="100%" height={30} />
        <Skeleton width="100%" height={30} />
        <Skeleton width="100%" height={30} />
      </Box>
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      amount: e.target.value,
      coin: value.coin,
    });
  };

  const handleSelectChange = (_, v) => {
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
        }}
        variant="outlined"
      >
        <OutlinedInput
          value={value?.amount}
          id="input-with-icon-adornment"
          type="number"
          placeholder="0"
          error={error}
          sx={{
            padding: 0,
            overflow: 'hidden',
          }}
          onChange={handleInputChange}
          endAdornment={
            <InputAdornment position="end">
              <Autocomplete
                value={value?.coin}
                options={Object.keys(coins)}
                loading={isLoading}
                disableClearable
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <Box
                      key={key}
                      component="li"
                      sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                      {...optionProps}
                    >
                      <img
                        loading="lazy"
                        width="20"
                        src={getCoinIconByUid(option.toLowerCase())}
                        alt=""
                      />
                      {option}
                    </Box>
                  );
                }}
                onChange={handleSelectChange}
                renderInput={(params) => (
                  <>
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <img
                              loading="lazy"
                              width="20"
                              src={getCoinIconByUid(value?.coin?.toLowerCase())}
                              alt=""
                            />
                          </InputAdornment>
                        ),
                        sx: {
                          paddingRight: 1,
                          width: `${Math.max(110, value.coin.length * 23)}px`, // Adjusts width dynamically
                        },
                      }}
                      sx={{
                        paddingRight: 1,
                      }}
                      // inputProps={{ style: { minWidth: "50px" } }}
                      variant="standard"
                    />
                  </>
                )}
              />
            </InputAdornment>
          }
        />
      </FormControl>
    </Box>
  );
}

export default withValidationProvider(SelectCoinAmount, (v) => v.amount);
