import { Box, Typography, Grid, Paper, Skeleton } from '@mui/material';
import { formatCurrency, formatFundsAmount } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import React, { useCallback } from 'react';

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
  loading,
  disabled,
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
        <Box display="flex" alignItems="center" onClick={handleMaxClick}>
          <Typography color="text.secondary">{t('Balance')}: </Typography>
          <Typography color="text.secondary" ml={1}>
            {formatFundsAmount(balance)}
          </Typography>
          {balanceUsdt !== undefined && (
            <Typography color="text.secondary" ml={1}>
              ({formatCurrency(balanceUsdt, 'usd')})
            </Typography>
          )}
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="text.secondary">
            {balance !== undefined ? renderBalance() : `${label}`}
          </Typography>
        </Box>

        <Box flexGrow={1} marginRight={2}>
          <NumericTextField
            variant="standard"
            placeholder={placeholder}
            value={value}
            clearable={false}
            allowNegative={false}
            onChange={handleInputChange}
            disabled={loading || disabled}
            min="0"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: 30,
              },
            }}
          />
          {value && asset && (
            <>
              {asset?.priceInUsdt ? (
                <Typography color="text.secondary" mt={-1}>
                  {formatCurrency(value * asset.priceInUsdt, 'usd')}
                </Typography>
              ) : (
                <Skeleton variant="text" width={100} height={20} />
              )}
            </>
          )}
        </Box>
      </Box>
      <SelectCoinsItem
        value={asset}
        onChange={onAssetChange}
        items={assets}
        placeholder={t('Select Token')}
        reversed={reversed}
        maxListItem={maxListItem}
        loading={loading || disabled}
        disabled={disabled}
        fuseSearchKeys={fuseSearchKeys}
        shouldSearchForImports={shouldSearchForImports}
      />
    </Paper>
  );
};

interface SwapFormProps {
  assetsListBuy: AssetModel[];
  assetsListSell: AssetModel[];
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
  disableReverse?: boolean;
  disabled?: boolean;
}

export const SwapForm: React.FC<SwapFormProps> = ({
  assetsListBuy,
  assetsListSell,
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
  disableReverse,
  disabled,
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
          assets={assetsListSell}
          balance={sellBalance}
          balanceUsdt={sellBalanceUsdt}
          placeholder={t('0')}
          loading={loading}
          reversed
          disabled={disabled}
        />
      </Grid>
      <Box
        position="relative"
        width="100%"
        display="flex"
        justifyContent="center"
      >
        <Box sx={{ position: 'absolute', transform: 'translateY(-50%)' }}>
          <SelectCoinsSwap
            disabled={disableReverse || disabled}
            loading={loading}
            vertical
            onClick={onReverse}
          />
        </Box>
      </Box>
      <Grid item xs={12}>
        <SwapInput
          label={t('Buy')}
          value={buyAmount}
          asset={buyAsset}
          onChange={onBuyAmountChange}
          onAssetChange={onBuyAssetChange}
          assets={assetsListBuy}
          balance={buyBalance}
          balanceUsdt={buyBalanceUsdt}
          placeholder={t('0')}
          reversed
          loading={loading}
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
};

export default SwapForm;
