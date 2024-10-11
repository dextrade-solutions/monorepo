import { Alert, Box, Button, Fade, TextField, Typography } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';
import { AdPreview, AdPreviewSkeleton, ButtonIcon } from 'dex-ui';
import { debounce, flatMap } from 'lodash';
import { useMemo, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { useSelector } from 'react-redux';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';

import { SortTypes } from './constants';
import P2PService from '../../../../app/services/p2p-service';
import { AdItem } from '../../../../app/types/p2p-swaps';
import {
  getFromToken,
  getFromTokenInputValue,
  getToToken,
} from '../../../ducks/swaps/swaps';
import { EXCHANGE_VIEW_ROUTE } from '../../../helpers/constants/routes';
import { useAuthP2P } from '../../../hooks/useAuthP2P';
import { useI18nContext } from '../../../hooks/useI18nContext';
import ItemPicker from '../modals/item-picker';

export default function P2PAds() {
  const t = useI18nContext();
  const auth = useAuthP2P();
  const navigate = useNavigate();
  const [providerName, setProviderName] = useState('');
  const toToken = useSelector(getToToken);
  const fromToken = useSelector(getFromToken);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);

  const [showSortPicker, setShowSortPicker] = useState(false);
  const [sortBy, setSortBy] = useState(SortTypes.byPrice);
  const [sortDesc, setSortDesc] = useState(false);

  const toggleSortPicker = () => {
    setShowSortPicker(!showSortPicker);
  };

  const filterModel = useMemo(
    () => ({
      notSupportedCoins: [],
      amountInCoin1:
        fromTokenInputValue === '' ? undefined : fromTokenInputValue,
      fromNetworkName: fromToken?.network,
      fromTicker: fromToken?.symbol,
      orderBy: sortBy,
      sort: sortDesc ? 'DESC' : undefined,
      toNetworkName: toToken?.network,
      toTicker: toToken?.symbol,
      name: providerName,
      size: 4,
    }),
    [fromToken, toToken, providerName, sortBy, sortDesc, fromTokenInputValue],
  );
  const { isFetching, isLoading, fetchNextPage, data } = useInfiniteQuery<
    AdItem[]
  >({
    queryKey: ['p2pAds', filterModel],
    queryFn: ({ pageParam }) =>
      P2PService.filterAds({ ...filterModel, page: pageParam }).then(
        (response) => response.data,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length + 1 : null;
    },
    refetchInterval: 10 * SECOND,
  });

  const handleSearchByProviderName = debounce((v: string) => {
    setProviderName(v);
  }, 500);

  const handleAdPreviewClick = (ad: AdItem) => {
    auth(() =>
      navigate({
        pathname: EXCHANGE_VIEW_ROUTE,
        search: `?${createSearchParams({
          fromNetworkName: ad.fromCoin.networkName,
          fromTicker: ad.fromCoin.ticker,
          toNetworkName: ad.toCoin.networkName,
          toTicker: ad.toCoin.ticker,
          name: ad.name,
        })}`,
      }),
    );
  };

  const isEmptyResult =
    data && !isLoading && !isFetching && !flatMap(data?.pages || []).length;

  return (
    <Box className="p2p-ads">
      {showSortPicker && (
        <ItemPicker
          value={sortBy}
          items={Object.values(SortTypes).map((value) => ({
            text: t(value),
            value,
          }))}
          onClose={toggleSortPicker}
          onSelect={(v) => setSortBy(v)}
        />
      )}
      <Box
        className="p2p-ads__search-options"
        display="flex"
        marginTop={2}
        marginBottom={2}
        alignItems="center"
      >
        <TextField
          className="flex-grow"
          size="small"
          label="Provider name"
          placeholder="Start typing..."
          fullWidth
          onChange={(e) => handleSearchByProviderName(e.target.value)}
        />
        <Box marginLeft={2}>
          <Button color="secondary" onClick={toggleSortPicker}>
            {t(sortBy)}
          </Button>
          <ButtonIcon
            iconName={`arrow-${sortDesc ? 'up' : 'down'}-dex`}
            onClick={() => setSortDesc(!sortDesc)}
          />
        </Box>
      </Box>
      <Box className="p2p-ads__list">
        {isEmptyResult && (
          <Alert variant="outlined" severity="info">
            There are no ads with the selected coin(s).
          </Alert>
        )}
        <TransitionGroup>
          {(data?.pages || []).map((group, idx) => (
            <Fade key={idx}>
              <Box>
                {group.map((i) => (
                  <Box marginTop={1} marginBottom={1} key={i.id}>
                    <AdPreview
                      ad={i}
                      fromTokenAmount={fromTokenInputValue}
                      onClick={() => handleAdPreviewClick(i)}
                    />
                  </Box>
                ))}
              </Box>
            </Fade>
          ))}
          <Fade>
            <div>
              <InView
                as="div"
                onChange={(inView) => {
                  if (inView && !isLoading && !isFetching) {
                    fetchNextPage();
                  }
                }}
              >
                {isFetching ? (
                  [...Array(3)].map((_, idx) => (
                    <Box key={idx} marginTop={1} marginBottom={1}>
                      <AdPreviewSkeleton />
                    </Box>
                  ))
                ) : (
                  <Box padding={4}></Box>
                )}
              </InView>
            </div>
          </Fade>
        </TransitionGroup>
      </Box>
    </Box>
  );
}
