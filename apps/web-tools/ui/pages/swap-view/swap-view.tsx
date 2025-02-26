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
      page: 1,
      size: 1,
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

  const [ad] = data || [];
  useEffect(() => {
    if (ad) {
      setAssetFrom(parseCoin(ad.fromCoin, ad.coinPair.priceCoin1InUsdt));
      setAssetTo(parseCoin(ad.toCoin, ad.coinPair.priceCoin2InUsdt));
    }
  }, [ad]);

  const handleGoTradeClick = () => {
    const params = new URLSearchParams(searchParams);
    if (assetFrom) {
      params.set('fromNetworkName', assetFrom.network);
      params.set('fromTicker', assetFrom.symbol);
    }
    if (assetTo) {
      params.set('toNetworkName', assetTo.network);
      params.set('toTicker', assetTo.symbol);
    }
    setSelectionMode(false);
    navigate(`?${params.toString()}`);
  };

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
        onChangeAssetFrom={setAssetFrom}
        onChangeAssetTo={setAssetTo}
        selectionMode={selectionMode}
        assetFrom={assetFrom}
        assetTo={assetTo}
        isLoading={isLoading}
      />
    </Box>
  );
}
