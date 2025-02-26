import { Box, Typography, TextField, Grid, Paper } from '@mui/material';
import { formatCurrency, formatFundsAmount } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { transform } from 'lodash';
import React, { useState, useCallback, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { NumericTextField, SelectCoinsItem, SelectCoinsSwap } from '..';

interface SwapInputProps {
  label: string;
  value: string;
  asset: AssetModel | null;
  onChange: (newValue: string) => void;
  onAssetChange: (newAsset: AssetModel | null) => void;
  assets: AssetModel[];
  balance?: string;
  balanceUsdt?: string;
  placeholder?: string;
  reversed?: boolean;
  maxListItem?: number;
  disabled?: boolean;
  loading?: boolean;
  fuseSearchKeys?: any;
  shouldSearchForImports?: boolean;
}

const SwapInput: React.FC<SwapInputProps> = ({
  label,
  value,
  asset,
  onChange,
  onAssetChange,
  assets,
  balance,
  balanceUsdt,
  placeholder,
  reversed,
  maxListItem = 10,
  disabled,
  loading,
  fuseSearchKeys,
  shouldSearchForImports,
}) => {
  const t = (v) => v;
  const handleInputChange = (v: string) => {
    onChange && onChange(v);
  }; // Debounce for 300ms

  const handleMaxClick = useCallback(() => {
    onChange(balance || '0');
  }, [balance, onChange]);

  const renderBalance = () => (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      {balance !== undefined && (
        <Box display="flex" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {t('Balance')}:{' '}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFundsAmount(balance)}
          </Typography>
          {balanceUsdt && (
            <Typography variant="caption" color="text.secondary" marginLeft={1}>
              ({formatCurrency(balanceUsdt, 'usd')})
            </Typography>
          )}
          <Typography
            component="span"
            marginLeft={1}
            fontWeight="bold"
            color="primary"
            sx={{ cursor: 'pointer' }}
            onClick={handleMaxClick}
          >
            {t('Max')}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'secondary.dark',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        py: 1,
        px: 2,
      }}
    >
      <Box>
        <Typography color="text.secondary">{label}</Typography>
        <Box flexGrow={1} marginRight={2}>
          <NumericTextField
            variant="standard"
            placeholder={placeholder}
            value={value}
            allowNegative={false}
            onChange={handleInputChange}
            disabled={disabled}
            min="0"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: 30,
              },
            }}
          />
          <Typography color="text.secondary" mt={-1}>
            {formatCurrency(0, 'usd')}
          </Typography>
        </Box>
      </Box>
      <SelectCoinsItem
        value={asset}
        onChange={onAssetChange}
        items={assets}
        placeholder={t('Select Token')}
        reversed={reversed}
        maxListItem={maxListItem}
        loading={loading}
        fuseSearchKeys={fuseSearchKeys}
        shouldSearchForImports={shouldSearchForImports}
      />
    </Paper>
  );
};

interface SwapFormProps {
  assets: AssetModel[];
  sellAsset: AssetModel | null;
  buyAsset: AssetModel | null;
  sellAmount: string;
  buyAmount: string;
  onSellAssetChange: (newAsset: AssetModel | null) => void;
  onBuyAssetChange: (newAsset: AssetModel | null) => void;
  onSellAmountChange: (newAmount: string) => void;
  onBuyAmountChange: (newAmount: string) => void;
  onReverse: () => void;
  sellBalance?: string;
  sellBalanceUsdt?: string;
  buyBalance?: string;
  buyBalanceUsdt?: string;
  loading?: boolean;
  fuseSearchKeys?: any;
  shouldSearchForImports?: boolean;
}

export const SwapForm: React.FC<SwapFormProps> = ({
  assets,
  sellAsset,
  buyAsset,
  sellAmount,
  buyAmount,
  onSellAssetChange,
  onBuyAssetChange,
  onSellAmountChange,
  onBuyAmountChange,
  onReverse,
  sellBalance,
  sellBalanceUsdt,
  buyBalance,
  buyBalanceUsdt,
  loading,
}) => {
  const t = (v) => v;

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <SwapInput
          label={t('Sell')}
          value={sellAmount}
          asset={sellAsset}
          onChange={onSellAmountChange}
          onAssetChange={onSellAssetChange}
          assets={assets}
          balance={sellBalance}
          balanceUsdt={sellBalanceUsdt}
          placeholder={t('0')}
          loading={loading}
          reversed
        />
      </Grid>
      <Box
        position="relative"
        width="100%"
        display="flex"
        justifyContent="center"
      >
        <Box sx={{ position: 'absolute', transform: 'translateY(-50%)' }}>
          <SelectCoinsSwap vertical onClick={onReverse} />
        </Box>
      </Box>
      <Grid item xs={12}>
        <SwapInput
          label={t('Buy')}
          value={buyAmount}
          asset={buyAsset}
          onChange={onBuyAmountChange}
          onAssetChange={onBuyAssetChange}
          assets={assets}
          balance={buyBalance}
          balanceUsdt={buyBalanceUsdt}
          placeholder={t('0')}
          reversed
          loading={loading}
        />
      </Grid>
    </Grid>
  );
};

export default SwapForm;
