import { Box, Grow } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';
import { AdItem, AssetModel } from 'dex-helpers/types';
import { Button, Swap } from 'dex-ui';
import { groupBy, map, orderBy, uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { parseCoin } from '../../app/helpers/p2p';
import P2PService from '../../app/services/p2p-service';
import { EXCHANGE_VIEW_ROUTE } from '../helpers/constants/routes';

export default function SwapWidget() {
  const [fromValue, setFromValue] = useState();
  const [toValue, setToValue] = useState();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const merchant = searchParams.get('name');
  const [currentAd, setCurrentAd] = React.useState<AdItem>();
  const [assetFrom, setAssetFrom] = React.useState<AssetModel | null>(null);
  const [assetTo, setAssetTo] = React.useState<AssetModel | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const currentFilter = {
    ...{ name: merchant, size: 100 },
    page: 1,
    notSupportedCoins: [],
  };

  const { data } = useQuery<AdItem[]>({
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
    if (currentAd) {
      const tradequery = new URLSearchParams(searchParams);
      const url = `https://p2p.dextrade.com${EXCHANGE_VIEW_ROUTE}?${tradequery.toString()}`;
      window.open(url, '_blank');
    }
  };

  const [ad] = allAds;

  useEffect(() => {
    const toNetworkName = searchParams.get('toNetworkName');
    const toTicker = searchParams.get('toTicker');
    if (ad) {
      if (toNetworkName && toTicker) {
        setAsset(
          toAssets.list.find(
            (i) => i.network === toNetworkName && i.symbol === toTicker,
          ),
          true,
        );
      } else {
        setAsset(ad.toAsset, true);
      }
      setIsLoading(false);
    }
  }, [ad]);

  useEffect(() => {
    if (!isLoading) {
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
  }, [assetFrom, assetTo, isLoading]);

  const disableReverse =
    (assetFrom && !toAssets.grouped[assetFrom.iso]) ||
    (assetTo && !fromAssets.grouped[assetTo.iso]);

  const updateValue = (v: string, reversed?: boolean) => {
    if (reversed) {
      setFromValue(v / ad?.coinPair.price);
    } else {
      setToValue(v * ad?.coinPair.price);
    }
  };
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="calc(100vh - 100px)"
    >
      <Swap
        assetsListSell={fromAssets.list}
        assetsListBuy={toAssets.list}
        buyAsset={assetTo}
        sellAsset={assetFrom}
        sellAmount={fromValue}
        loading={isLoading}
        buyAmount={toValue}
        onReverse={() => {
          setAsset(assetTo);
          setAsset(assetFrom, true);
        }}
        disableReverse={disableReverse}
        onBuyAssetChange={setAssetTo}
        onSellAssetChange={setAssetFrom}
        onBuyAmountChange={(v) => updateValue(v, true)}
        onSellAmountChange={updateValue}
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
