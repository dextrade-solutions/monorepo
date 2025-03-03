import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';
import { AdItem, AssetModel } from 'dex-helpers/types';
import { Icon, Button, Atom } from 'dex-ui';
import { groupBy, map, orderBy, uniqBy } from 'lodash';
import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { SwapViewContent } from './swap-view-content';
import { parseCoin } from '../../../app/helpers/p2p';
import P2PService from '../../../app/services/p2p-service';
import { HOME_ROUTE } from '../../helpers/constants/routes';
import { useI18nContext } from '../../hooks/useI18nContext';

export default function AdView() {
  const t = useI18nContext();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const isWidget = Boolean(searchParams.get('widget'));
  const merchant = searchParams.get('name');
  const [currentAd, setCurrentAd] = React.useState<AdItem>();
  const [assetFrom, setAssetFrom] = React.useState<AssetModel | null>(null);
  const [assetTo, setAssetTo] = React.useState<AssetModel | null>(null);
  const [selectionMode, setSelectionMode] = useState(isWidget);

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
    ...(selectionMode ? { name: merchant, size: 100 } : firstAdFilter),
    page: 1,
    notSupportedCoins: [],
  };

  const { isLoading, data } = useQuery<AdItem[]>({
    queryKey: ['p2pAds', currentFilter],
    queryFn: () =>
      P2PService.filterAds(currentFilter).then((response) =>
        response.data.map((ad) => ({
          ...ad,
          fromAsset: parseCoin(ad.fromCoin, ad.coinPair.priceCoin1InUsdt),
          toAsset: {
            ...parseCoin(ad.toCoin, ad.coinPair.priceCoin2InUsdt),
            balanceUsdt: ad.reserveSum * ad.coinPair.priceCoin2InUsdt,
          },
        })),
      ),
    refetchInterval: 20 * SECOND,
  });

  const handleNavigateBack = () => {
    if (navigate(-1) === undefined) {
      // Check if navigate(-1) returns undefined (meaning no history)
      navigate(HOME_ROUTE); // Navigate to home route if no history
    }
  };

  const allAds = orderBy(data || [], 'toAsset.balanceUsdt', 'desc');

  const fromAssets = {
    grouped: groupBy(allAds, (i) => i.fromAsset.iso),
    list: map(
      uniqBy(allAds, (i) => i.fromAsset.iso),
      'fromAsset',
    ),
  };
  const toAssets = {
    grouped: groupBy(allAds, (i) => i.toAsset.iso),
    list: map(
      uniqBy(allAds, (i) => i.toAsset.iso),
      'toAsset',
    ),
  };

  const setAsset = (asset: AssetModel, reversed?: boolean) => {
    // const params = new URLSearchParams(searchParams);
    if (reversed) {
      setAssetTo(asset);
    } else {
      setAssetFrom(asset);
    }
  };

  const handleGoTradeClick = () => {
    setSelectionMode(false);
  };
  const [ad] = allAds;

  useEffect(() => {
    if (ad) {
      if (!isWidget) {
        setAsset(ad.fromAsset);
      }
      setAsset(ad.toAsset, true);
      if (!selectionMode) {
        setCurrentAd(ad);
      }
    }
  }, [ad, selectionMode]);

  useEffect(() => {
    if (selectionMode) {
      if (assetFrom) {
        searchParams.set('fromNetworkName', assetFrom.network);
        searchParams.set('fromTicker', assetFrom.symbol);
      } else {
        searchParams.delete('fromNetworkName');
        searchParams.delete('fromTicker');
      }
      if (assetTo) {
        searchParams.set('toNetworkName', assetTo?.network);
        searchParams.set('toTicker', assetTo?.symbol);
      } else {
        searchParams.delete('toNetworkName');
        searchParams.delete('toTicker');
      }
      if (assetFrom && assetTo) {
        setCurrentAd(
          allAds.find(
            (i) =>
              i.fromAsset.iso === assetFrom.iso &&
              i.toAsset.iso === assetTo.iso,
          ),
        );
      } else {
        setCurrentAd(undefined);
      }
      navigate(`?${searchParams.toString()}`);
    }
  }, [assetFrom, assetTo, selectionMode]);

  return (
    <Box>
      <Box display="flex" alignItems="center" padding={1}>
        {isLoading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : (
          <>
            {currentAd?.isAtomicSwap && <Atom mr={1} />}
            <Typography variant="h6">
              {currentAd?.isAtomicSwap ? 'Atomic Swap' : 'Swap'}
            </Typography>
          </>
        )}
        <div className="flex-grow" />
        {isWidget ? (
          <Typography>{merchant}</Typography>
        ) : (
          <Box>
            <Button
              startIcon={<Icon name="arrow-left-dex" />}
              sx={{ color: 'text.primary' }}
              onClick={handleNavigateBack}
            >
              {t('back')}
            </Button>
          </Box>
        )}
      </Box>
      <SwapViewContent
        ad={currentAd}
        handleGoTradeClick={handleGoTradeClick}
        onChangeAssetFrom={setAsset}
        onChangeAssetTo={(v) => setAsset(v, true)}
        selectionMode={selectionMode}
        toAssetsList={
          assetFrom
            ? (fromAssets.grouped[assetFrom.iso] || []).map((i) => i.toAsset)
            : toAssets.list
        }
        fromAssetsList={
          assetTo
            ? (toAssets.grouped[assetTo.iso] || []).map((i) => i.fromAsset)
            : fromAssets.list
        }
        disableReverse={
          (assetFrom && !toAssets.grouped[assetFrom.iso]) ||
          (assetTo && !fromAssets.grouped[assetTo.iso])
        }
        assetFrom={assetFrom}
        assetTo={assetTo}
        isLoading={isLoading}
      />
    </Box>
  );
}
