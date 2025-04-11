import { Alert, Box, Fade, InputAdornment, TextField } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';
import { AdItem } from 'dex-helpers/types';
import {
  AdPreview,
  AdPreviewSkeleton,
  ButtonIcon,
  Icon,
  useGlobalModalContext,
} from 'dex-ui';
import { flatMap } from 'lodash';
import React, { useMemo, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';

import { SortTypes } from './constants';
import { getAdPathname } from '../../../../app/helpers/p2p';
import P2PService from '../../../../app/services/p2p-service';
import {
  getFromTokenInputValue,
  setFromToken,
  setToToken,
} from '../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useQueryAds } from '../../../hooks/useQueryAds';

const PER_PAGE_SIZE = 8;

export default function P2PAds() {
  const { showModal } = useGlobalModalContext();
  const t = useI18nContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { fromToken, toToken, providerName, setProviderName } = useQueryAds();
  const fromTokenInputValue = useSelector(getFromTokenInputValue);

  const [sortBy, setSortBy] = useState(SortTypes.byPrice);
  const [sortDesc, setSortDesc] = useState(false);

  const toggleSortPicker = () => {
    showModal({
      name: 'ITEM_PICKER',
      title: t('Sort by'), // Changed here
      value: sortBy,
      options: Object.values(SortTypes).map((value) => ({
        text: t(value),
        value,
      })),
      onSelect: (v) => setSortBy(v),
    });
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
      pathname: getAdPathname({
        fromNetworkName: ad.fromCoin.networkName,
        fromTicker: ad.fromCoin.ticker,
        toNetworkName: ad.toCoin.networkName,
        toTicker: ad.toCoin.ticker,
        name: ad.name,
      }),
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
        mx={1}
        marginBottom={2}
        alignItems="center"
      >
        <TextField
          value={providerName}
          data-testid="p2p-ads__search-by-merchant"
          className="flex-grow"
          size="small"
          placeholder={t('Search')} // Changed here
          fullWidth
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <Icon color="text.secondary" name="search" />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setProviderName(e.target.value)}
        />

        {(fromToken || toToken || providerName) && (
          <Box marginLeft={2}>
            <ButtonIcon
              size="xl"
              sx={{
                color: 'text.primary',
              }}
              iconName="filter-clean"
              onClick={() => cleanFilter()}
            />
          </Box>
        )}
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
      </Box>
      <Box className="p2p-ads__list">
        {isEmptyResult && (
          <Alert variant="outlined" severity="info">
            {t('There are no ads with the selected coin(s).')}
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
