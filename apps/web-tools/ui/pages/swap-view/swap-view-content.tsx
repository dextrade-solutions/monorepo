import {
  Box,
  Card,
  CardContent,
  Grow,
  Skeleton,
  Typography,
} from '@mui/material';
import { AdItem, AssetModel } from 'dex-helpers/types';
import { Swap, Button } from 'dex-ui';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import P2PSwapView from '../../components/app/p2p-swap-view';
import {
  getFromTokenInputValue,
  setFromTokenInputValue,
} from '../../ducks/swaps/swaps';
import { useI18nContext } from '../../hooks/useI18nContext';

// Define the type for the props of SwapViewContent
export interface SwapViewContentProps {
  ad: AdItem | null; // 'ad' can be an AdItem or null if no ad is found
  fromAssetsList: AssetModel[];
  toAssetsList: AssetModel[];
  assetFrom: AssetModel | null; // 'assetFrom' can be an AssetModel or null
  assetTo: AssetModel | null; // 'assetTo' can be an AssetModel or null
  isLoading: boolean;
  selectionMode: boolean;
  disableReverse: boolean;
  onChangeAssetFrom: (asset: AssetModel | null) => void; // 'onChangeAssetFrom' is a function that takes an AssetModel or null and returns void
  onChangeAssetTo: (asset: AssetModel | null) => void; // 'onChangeAssetTo' is a function that takes an AssetModel or null and returns void
  handleGoTradeClick: () => void; // 'handleGoTradeClick' is a function that takes no arguments and returns void
}

export const SwapViewContent = ({
  ad,
  fromAssetsList = [],
  toAssetsList = [],
  assetFrom,
  assetTo,
  isLoading,
  selectionMode,
  disableReverse,
  onChangeAssetFrom,
  onChangeAssetTo,
  handleGoTradeClick,
}: SwapViewContentProps) => {
  const value = useSelector(getFromTokenInputValue);
  const [toValue, setToValue] = useState();
  const dispatch = useDispatch();

  const updateValue = (v: string, reversed?: boolean) => {
    if (reversed) {
      dispatch(setFromTokenInputValue(v / ad?.coinPair.price));
    } else {
      setToValue(v * ad?.coinPair.price);
    }
  };
  const t = useI18nContext();
  // <Box marginTop={3}>
  //   <Alert severity="info">Ad not found...</Alert>
  // </Box>

  useEffect(() => {
    if (!ad) {
      updateValue('');
    }
  }, [ad]);

  if (selectionMode) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="calc(100vh - 100px)"
      >
        <Swap
          assetsListSell={fromAssetsList}
          assetsListBuy={toAssetsList}
          buyAsset={assetTo}
          sellAsset={assetFrom}
          sellAmount={value}
          loading={isLoading}
          buyAmount={toValue}
          onReverse={() => {
            onChangeAssetFrom(assetTo);
            onChangeAssetTo(assetFrom);
          }}
          disableReverse={disableReverse}
          onBuyAssetChange={onChangeAssetTo}
          onBuyAmountChange={(v) => updateValue(v, true)}
          onSellAmountChange={updateValue}
          onSellAssetChange={onChangeAssetFrom}
        />
        <Grow in={Boolean(assetFrom && assetTo)}>
          <Box width="100%">
            <Button
              sx={{ mt: 3, minHeight: 60, fontWeight: 'bold', fontSize: 20 }}
              gradient
              fullWidth
              onClick={handleGoTradeClick}
            >
              Go trade
            </Button>
          </Box>
        </Grow>
      </Box>
    );
  }

  if (!ad && isLoading) {
    return (
      <>
        <Box marginBottom={2}>
          <Typography
            variant="body2"
            color="text.secondary"
            marginBottom={1}
            marginLeft={1}
          >
            {t('youGive')}
          </Typography>
          <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <Skeleton variant="circular" height={40} width={40} />
                <Box marginLeft={1}>
                  <Skeleton width={40} />
                  <Skeleton width={60} />
                </Box>
              </Box>
              <Skeleton />
            </CardContent>
          </Card>
        </Box>
        <Box marginBottom={2}>
          <Typography
            variant="body2"
            color="text.secondary"
            marginBottom={1}
            marginLeft={1}
          >
            {t('youGet')}
          </Typography>
          <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <Skeleton variant="circular" height={40} width={40} />
                <Box marginLeft={1}>
                  <Skeleton width={40} />
                  <Skeleton width={60} />
                </Box>
              </Box>
              <Skeleton />
            </CardContent>
          </Card>
        </Box>
        <Skeleton width="100%" height={50} />
        <Skeleton width="80%" height={50} />
        <Skeleton width="30%" height={50} />
      </>
    );
  }

  if (ad && assetFrom && assetTo) {
    return <P2PSwapView ad={ad} assetFrom={assetFrom} assetTo={assetTo} />;
  }
};
