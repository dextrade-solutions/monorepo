import { Alert, Box, Fade, InputAdornment, TextField } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';
import { AdItem } from 'dex-helpers/types';
import { AdPreview, AdPreviewSkeleton, ButtonIcon, Icon } from 'dex-ui';
import { debounce, flatMap } from 'lodash';
import React, { useMemo, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';

import { SortTypes } from './constants';
import P2PService from '../../../../app/services/p2p-service';
import { showModal } from '../../../ducks/app/app';
import {
  getFromToken,
  getFromTokenInputValue,
  getToToken,
  setFromToken,
  setToToken,
} from '../../../ducks/swaps/swaps';
import { EXCHANGE_VIEW_ROUTE } from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';

export default function P2PAds() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [providerName, setProviderName] = useState('');
  const toToken = useSelector(getToToken);
  const fromToken = useSelector(getFromToken);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);

  const [sortBy, setSortBy] = useState(SortTypes.byPrice);
  const [sortDesc, setSortDesc] = useState(false);

  const toggleSortPicker = () => {
    dispatch(
      showModal({
        name: 'ITEM_PICKER',
        title: 'Sort by',
        value: sortBy,
        options: Object.values(SortTypes).map((value) => ({
          text: t(value),
          value,
        })),
        onSelect: (v) => setSortBy(v),
      }),
    );
  };

  const cleanFilter = () => {
    setProviderName('');
    dispatch(setFromToken(null));
    dispatch(setToToken(null));
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
      size: 8,
    }),
    [fromToken, toToken, providerName, sortBy, sortDesc, fromTokenInputValue],
  );
  const { isFetchingNextPage, isFetching, isLoading, fetchNextPage, data } =
    useInfiniteQuery<AdItem[]>({
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

  const handleAdPreviewClick = (ad: AdItem) => {
    navigate({
      pathname: EXCHANGE_VIEW_ROUTE,
      search: `?${createSearchParams({
        fromNetworkName: ad.fromCoin.networkName,
        fromTicker: ad.fromCoin.ticker,
        toNetworkName: ad.toCoin.networkName,
        toTicker: ad.toCoin.ticker,
        name: ad.name,
      })}`,
    });
  };

  const isEmptyResult =
    data && !isLoading && !isFetching && !flatMap(data?.pages || []).length;

  return (
    <Box className="p2p-ads">
      <Box
        className="p2p-ads__search-options"
        display="flex"
        marginTop={2}
        marginBottom={2}
        alignItems="center"
      >
        <TextField
          value={providerName}
          className="flex-grow"
          size="small"
          placeholder="Search by exchanger name"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon color="text.secondary" name="search" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setProviderName(e.target.value)}
        />
        <Box marginLeft={2}>
          <ButtonIcon
            iconProps={{
              color: 'text.secondary',
            }}
            size="xl"
            iconName="sort"
            onClick={toggleSortPicker}
          />
        </Box>
        {(fromToken || toToken || providerName) && (
          <Box marginLeft={2}>
            <ButtonIcon
              iconProps={{
                color: 'text.secondary',
              }}
              size="xl"
              iconName="filter-clean"
              onClick={() => cleanFilter()}
            />
          </Box>
        )}
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
                  if (inView && !isLoading && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
              >
                {isLoading || isFetchingNextPage ? (
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
