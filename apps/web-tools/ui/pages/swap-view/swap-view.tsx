import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';
import { AdItem, AssetModel } from 'dex-helpers/types';
import { Icon, Button } from 'dex-ui';
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

  const [assetFrom, setAssetFrom] = React.useState<AssetModel | null>(null);
  const [assetTo, setAssetTo] = React.useState<AssetModel | null>(null);
  const [selectionMode, setSelectionMode] = useState(isWidget);

  const filterModel = useMemo(
    () => ({
      fromNetworkName: searchParams.get('fromNetworkName'),
      fromTicker: searchParams.get('fromTicker'),
      toNetworkName: searchParams.get('toNetworkName'),
      toTicker: searchParams.get('toTicker'),
      name: merchant,
      size: 100,
      page: 1,
      notSupportedCoins: [],
    }),
    [searchParams, merchant],
  );

  const { isLoading, data } = useQuery<AdItem[]>({
    queryKey: ['p2pAds', filterModel],
    queryFn: () =>
      P2PService.filterAds(filterModel).then((response) => response.data),
    refetchInterval: 10 * SECOND,
  });

  const handleNavigateBack = () => {
    if (navigate(-1) === undefined) {
      // Check if navigate(-1) returns undefined (meaning no history)
      navigate(HOME_ROUTE); // Navigate to home route if no history
    }
  };

  const allAds = data || [];

  const fromAssetsList = allAds.map((ad) =>
    parseCoin(ad.fromCoin, ad.coinPair.priceCoin1InUsdt),
  );
  const toAssetsList = allAds.map((ad) =>
    parseCoin(ad.toCoin, ad.coinPair.priceCoin2InUsdt),
  );

  const [ad] = allAds;

  const setAsset = (asset: AssetModel, reversed?: boolean) => {
    const params = new URLSearchParams(searchParams);

    const network = reversed ? 'toNetworkName' : 'fromNetworkName';
    const ticker = reversed ? 'toTicker' : 'fromTicker';
    if (asset?.network) {
      params.set(network, asset.network);
    } else {
      params.delete(network);
    }
    if (asset?.symbol) {
      params.set(ticker, asset.symbol);
    } else {
      params.delete(ticker);
    }
    navigate(`?${params.toString()}`);
  };

  const handleGoTradeClick = () => {
    setSelectionMode(false);
  };

  useEffect(() => {
    const from = {
      networkName: searchParams.get('fromNetworkName'),
      ticker: searchParams.get('fromTicker'),
    };
    const to = {
      networkName: searchParams.get('toNetworkName'),
      ticker: searchParams.get('toTicker'),
    };
    if (from.networkName && from.ticker) {
      setAssetFrom(parseCoin(from));
    } else {
      setAssetFrom(null);
    }
    if (to.networkName && to.ticker) {
      setAssetTo(parseCoin(to));
    } else {
      setAssetTo(null);
    }
  }, [searchParams]);

  return (
    <Box>
      <Box display="flex" alignItems="center" padding={1}>
        <Typography variant="h6">Swap</Typography>
        <div className="flex-grow" />
        {isWidget ? (
          <Typography>{merchant}</Typography>
        ) : (
          <Box>
            <Button
              startIcon={<Icon name="arrow-left-dex" />}
              onClick={handleNavigateBack}
            >
              {t('back')}
            </Button>
          </Box>
        )}
      </Box>
      <SwapViewContent
        ad={ad}
        handleGoTradeClick={handleGoTradeClick}
        onChangeAssetFrom={setAsset}
        onChangeAssetTo={(v) => setAsset(v, true)}
        selectionMode={selectionMode}
        fromAssetsList={fromAssetsList}
        toAssetsList={toAssetsList}
        assetFrom={assetFrom}
        assetTo={assetTo}
        isLoading={isLoading}
      />
    </Box>
  );
}
