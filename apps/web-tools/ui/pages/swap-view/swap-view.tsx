import { Alert, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';
import { AdItem, AssetModel, CoinModel } from 'dex-helpers/types';
import { Icon, Button, Atom } from 'dex-ui';
import React, { useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fromBase64 } from 'uint8array-tools';

import { SwapViewContent } from './swap-view-content';
import { parseCoin } from '../../../app/helpers/p2p';
import P2PService from '../../../app/services/p2p-service';
import { setFromTokenInputValue } from '../../ducks/swaps/swaps';
import { HOME_ROUTE } from '../../helpers/constants/routes';
import { useI18nContext } from '../../hooks/useI18nContext';

export default function AdView() {
  const t = useI18nContext();
  const navigate = useNavigate();
  const { id } = useParams();

  const searchParams = useMemo(() => {
    try {
      const decodedString = Buffer.from(fromBase64(id), 'hex').toString();
      return new URLSearchParams(decodedString);
    } catch (error) {
      console.error('Error decoding URLSearchParams:', error);
      return new URLSearchParams();
    }
  }, [id]);

  const merchant = searchParams.get('name');
  const initialAmount = searchParams.get('amount');

  const [assetFrom, setAssetFrom] = React.useState<AssetModel | null>(null);
  const [assetTo, setAssetTo] = React.useState<AssetModel | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<React.ReactNode | null>(null);
  const dispatch = useDispatch();
  const firstAdFilter = useMemo(
    () => ({
      fromNetworkName: searchParams.get('fromNetworkName'),
      fromTicker: searchParams.get('fromTicker'),
      toNetworkName: searchParams.get('toNetworkName'),
      toTicker: searchParams.get('toTicker'),
      name: merchant,
      size: 1,
    }),
    [searchParams, merchant],
  );

  const currentFilter = {
    ...firstAdFilter,
    page: 1,
    notSupportedCoins: [],
  };

  const { data } = useQuery<AdItem[]>({
    queryKey: ['p2pAds', currentFilter],
    queryFn: () => P2PService.filterAds(currentFilter),
    refetchInterval: 20 * SECOND,
  });

  const handleNavigateBack = () => {
    if (navigate(-1) === undefined) {
      // Check if navigate(-1) returns undefined (meaning no history)
      navigate(HOME_ROUTE); // Navigate to home route if no history
    }
  };

  const allAds = (data?.data || []) as AdItem[];

  const [currentAd] = allAds;

  const setAsset = (
    coin: CoinModel,
    priceInUsdt: number,
    recieveClientCoin: boolean,
  ) => {
    try {
      const asset = parseCoin(coin, priceInUsdt);
      if (!asset) {
        throw new Error('Asset is null');
      }
      if (recieveClientCoin) {
        setAssetTo(asset);
      } else {
        setAssetFrom(asset);
      }
    } catch (e) {
      setError(
        <>
          Coin <b>{coin.networkName}</b> <b>{coin.networkType}</b>{' '}
          <b>{coin.ticker}</b> temporary is not supported, try again later or
          contact support
        </>,
      );
    }
  };

  useEffect(() => {
    if (currentAd) {
      setAsset(currentAd.fromCoin, currentAd.coinPair.priceCoin1InUsdt, false);
      setAsset(currentAd.toCoin, currentAd.coinPair.priceCoin2InUsdt, true);
      if (initialAmount) {
        dispatch(setFromTokenInputValue(initialAmount));
      }
      setIsLoading(false);
    }
  }, [currentAd]);

  return (
    <Box>
      <Box display="flex" alignItems="center" padding={1}>
        {isLoading ? (
          <Typography color="text.secondary">{t('loading')}</Typography>
        ) : (
          <>
            {currentAd?.isAtomicSwap && <Atom mr={1} />}
            <Typography variant="h6">
              {currentAd?.isAtomicSwap ? t('atomic-swap') : t('swap')}
            </Typography>
          </>
        )}
        <div className="flex-grow" />
        <Box>
          <Button
            startIcon={<Icon name="arrow-left-dex" />}
            sx={{ color: 'text.primary' }}
            onClick={handleNavigateBack}
          >
            {t('back')}
          </Button>
        </Box>
      </Box>
      {!error && assetFrom && assetTo && (
        <SwapViewContent
          ad={currentAd}
          assetFrom={assetFrom}
          assetTo={assetTo}
          isLoading={isLoading}
        />
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
