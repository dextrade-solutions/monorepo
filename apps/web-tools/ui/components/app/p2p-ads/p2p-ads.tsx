import { Alert, Box, Fade, InputAdornment, TextField } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';
import { AdItem } from 'dex-helpers/types';
import { AdPreview, AdPreviewSkeleton, ButtonIcon, Icon } from 'dex-ui';
import { flatMap } from 'lodash';
import React, { useMemo, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';

import { SortTypes } from './constants';
import P2PService from '../../../../app/services/p2p-service';
import { showModal } from '../../../ducks/app/app';
import {
  getFromTokenInputValue,
  setFromToken,
  setToToken,
} from '../../../ducks/swaps/swaps';
import { EXCHANGE_VIEW_ROUTE } from '../../../helpers/constants/routes';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useQueryAds } from '../../../hooks/useQueryAds';

const PER_PAGE_SIZE = 8;

export default function P2PAds() {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { fromToken, toToken, providerName, setProviderName } = useQueryAds();
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
      size: PER_PAGE_SIZE,
    }),
    [fromToken, toToken, providerName, sortBy, sortDesc, fromTokenInputValue],
  );
  const { isFetching, isLoading, fetchNextPage, data, hasNextPage } =
    useInfiniteQuery<AdItem[]>({
      queryKey: ['p2pAds', filterModel],
      queryFn: ({ pageParam }) =>
        P2PService.filterAds({ ...filterModel, page: pageParam }).then(
          (response) => response.data,
        ),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < PER_PAGE_SIZE) {
          return null;
        }
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
  const renderList = flatMap(data?.pages || []);

  const isEmptyResult = data && !isLoading && !isFetching && !renderList.length;

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
          data-testid="p2p-ads__search-by-merchant"
          className="flex-grow"
          size="small"
          placeholder="Search by merchant name"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon color="text.secondary" name="search" />
              </InputAdornment>
            ),
            endAdornment: providerName && (
              <InputAdornment position="end">
                <ButtonIcon
                  color="text.secondary"
                  size="sm"
                  iconName="close"
                  onClick={() => setProviderName('')}
                />
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
          {renderList.map((i) => (
            <Fade key={i.id}>
              <Box data-testid={i.id} marginTop={1} marginBottom={1}>
                <AdPreview
                  ad={i}
                  fromTokenAmount={fromTokenInputValue}
                  onClick={() => handleAdPreviewClick(i)}
                />
              </Box>
            </Fade>
          ))}
        </TransitionGroup>

        <InView
          onChange={(inView) => {
            if (inView && hasNextPage) {
              fetchNextPage();
            }
          }}
        >
          {isLoading || (!isLoading && hasNextPage) ? (
            [...Array(3)].map((_, idx) => (
              <Box key={idx} marginTop={1} marginBottom={1}>
                <AdPreviewSkeleton />
              </Box>
            ))
          ) : (
            <Box padding={4}></Box>
          )}
        </InView>
      </Box>
    </Box>
  );
}
