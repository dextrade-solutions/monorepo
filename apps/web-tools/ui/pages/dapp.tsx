import { Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  DEXTRADE_APP_STORE_LINK,
  DEXTRADE_GOOGLE_PLAY_LINK,
  isIOS,
} from 'dex-helpers';
import { AdItem } from 'dex-helpers/types';
import React, { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import P2PService from '../../app/services/p2p-service';

export default function DappOpen() {
  const [searchParams] = useSearchParams();

  const filterModel = useMemo(
    () => ({
      fromNetworkName: searchParams.get('fromNetworkName'),
      fromTicker: searchParams.get('fromTicker'),
      toNetworkName: searchParams.get('toNetworkName'),
      toTicker: searchParams.get('toTicker'),
      name: searchParams.get('name'),
      page: 1,
      size: 1,
      notSupportedCoins: [],
    }),
    [searchParams],
  );

  const { isLoading, data, error } = useQuery<AdItem[]>({
    queryKey: ['p2pAds', filterModel],
    queryFn: () =>
      P2PService.filterAds(filterModel).then((response) => response.data),
  });

  useEffect(() => {
    const redirectToApp = async (adId: number) => {
      const appDeepLink = new URL(`com.dextrade://open-trade?id=${adId}`);

      searchParams.forEach((value, key) => {
        appDeepLink.searchParams.append(key, value);
      });

      try {
        window.location.href = appDeepLink.toString();
        setTimeout(() => {
          window.location.href = isIOS
            ? DEXTRADE_APP_STORE_LINK
            : DEXTRADE_GOOGLE_PLAY_LINK;
        }, 1000);
      } catch (error) {
        window.location.href = isIOS
          ? DEXTRADE_APP_STORE_LINK
          : DEXTRADE_GOOGLE_PLAY_LINK;
      }
    };

    if (data) {
      const [ad] = data;
      redirectToApp(ad.id);
    }
  }, [searchParams, data]);

  // Display loading or error messages if necessary, although they might not be visible due to the immediate redirect
  if (isLoading) {
    return <Alert severity="info">Loading...</Alert>;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return null; // Or a loading indicator if you prefer
}
