import { Box, TextField, Skeleton, Autocomplete } from '@mui/material';
import { getCoinIconByUid } from 'dex-helpers';
import { UrlIcon, withValidationProvider } from 'dex-ui';
import React from 'react';

import { useQuery } from '../../hooks/use-query';
import { Currency } from '../../services';
import { ICoin } from '../../types';

type InputValue = {
  amount: number;
  coin: ICoin;
};

function SelectCoinAmount({
  value,
  onChange,
}: {
  value?: InputValue;
  onChange: (v: InputValue) => void;
}) {
  const coins = useQuery(Currency.coins);

  const allCoins = coins.data?.list.currentPageResult || [];
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

  const handleSelectChange = (v) => {
    onChange({
      amount: value.amount,
      coin: v,
    });
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <TextField
        value={value?.amount}
        sx={{
          width: '100%',
        }}
        onChange={handleInputChange}
        type="number"
        placeholder="0.1"
        InputProps={{
          inputMode: 'decimal',
        }}
      />
      <Autocomplete
        value={value?.coin}
        options={allCoins}
        loading={coins.isLoading}
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
                src={getCoinIconByUid(option.iso)}
                alt=""
              />
              {option.iso}
            </Box>
          );
        }}
        onChange={handleSelectChange}
        renderInput={(params) => <TextField {...params} label="Currency" />}
      />
    </Box>
  );
}

export default withValidationProvider(SelectCoinAmount, (v) => v);
