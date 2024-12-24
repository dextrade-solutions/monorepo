import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AdItem } from 'dex-helpers/types';
import { Icon } from 'dex-ui';
import { sumBy } from 'lodash';
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { parseCoin } from '../../../app/helpers/p2p';
import P2PService from '../../../app/services/p2p-service';
import P2PSwapView from '../../components/app/p2p-swap-view';
import { useI18nContext } from '../../hooks/useI18nContext';

export default function AdView() {
  const t = useI18nContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isIframe = Boolean(searchParams.get('iframe'));
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

  const { isLoading, data } = useQuery<AdItem[]>({
    queryKey: ['p2pAds', filterModel],
    queryFn: () =>
      P2PService.filterAds(filterModel).then((response) => response.data),
  });

  let content = (
    <Box marginTop={3}>
      <Alert severity="info">Ad not found...</Alert>
    </Box>
  );

  const [ad] = data || [];
  if (ad) {
    const assetFrom = parseCoin(ad.fromCoin, ad.coinPair.priceCoin1InUsdt);
    const assetTo = parseCoin(ad.toCoin, ad.coinPair.priceCoin2InUsdt);
    if (ad.reserve) {
      ad.reserveInCoin2 = sumBy(ad.reserve, 'reserveInCoin2');
    }

    if (assetFrom && assetTo) {
      content = <P2PSwapView ad={ad} assetFrom={assetFrom} assetTo={assetTo} />;
    } else {
      content = (
        <Alert variant="outlined" severity="warning">
          Sorry, this pair currently does not supported
        </Alert>
      );
    }
  } else if (isLoading) {
    content = (
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

  return (
    <Box>
      <Box display="flex" alignItems="center" padding={1}>
        <Typography variant="h6">Swap</Typography>
        <div className="flex-grow" />
        {!isIframe && (
          <Box>
            <Button
              startIcon={<Icon name="arrow-left-dex" />}
              color="secondary"
              variant="contained"
              onClick={() => navigate(-1)}
            >
              {t('back')}
            </Button>
          </Box>
        )}
      </Box>
      {content}
    </Box>
  );
}
