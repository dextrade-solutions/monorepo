import { Alert, Box, Fade, InputAdornment, TextField } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SECOND } from 'dex-helpers';
import { AdItem } from 'dex-helpers/types';
import { exchangerService } from 'dex-services';
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
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';

import { SortTypes } from './constants';
import { getAdPathname } from '../../../../app/helpers/p2p';
import P2PService from '../../../../app/services/p2p-service';
import { getFromTokenInputValue } from '../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useQueryAds } from '../../../hooks/useQueryAds';
import { PairGroupCard } from '../pair-group-card/pair-group-card';

const PER_PAGE_SIZE = 8;

export default function P2PAds({ iosIFrame = false }: { iosIFrame?: boolean }) {
  const { showModal } = useGlobalModalContext();
  const t = useI18nContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { fromToken, toToken, providerName } = useQueryAds();
  const fromTokenInputValue = useSelector(getFromTokenInputValue);

  const hasQueryParams = Boolean(fromToken || toToken || providerName);

  const [sortBy, setSortBy] = useState(SortTypes.byPrice);
  const [sortDesc, setSortDesc] = useState(false);

  const toggleSortPicker = () => {
    showModal({
      name: 'ITEM_PICKER',
      title: t('Sort by'),
      value: sortBy,
      options: Object.values(SortTypes).map((value) => ({
        text: t(value),
        value,
      })),
      onSelect: (v) => setSortBy(v),
    });
  };

  const cleanFilter = () => {
    setSearchParams(new URLSearchParams());
  };

  const filterModel = useMemo(
    () => ({
      notSupportedCoins: [],
      amountInCoin1:
        fromTokenInputValue === '' ? undefined : Number(fromTokenInputValue),
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

  const {
    isLoading: isPairGroupsLoading,
    fetchNextPage: fetchNextPairGroupsPage,
    data: pairGroupsData,
    hasNextPage: hasNextPairGroupsPage,
  } = useInfiniteQuery({
    queryKey: ['pairGroups'],
    queryFn: ({ pageParam = 1 }) =>
      exchangerService.getExchangerFilterGroup({
        query: {
          page: pageParam,
          size: PER_PAGE_SIZE,
        },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < PER_PAGE_SIZE) {
        return null;
      }
      return lastPage.data.length ? allPages.length + 1 : null;
    },
    enabled: !hasQueryParams,
  });

  const {
    isFetching,
    isLoading: isAdsLoading,
    fetchNextPage,
    data,
    hasNextPage: hasNextAdsPage,
  } = useInfiniteQuery<AdItem[]>({
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
    enabled: hasQueryParams,
  });

  const handleAdPreviewClick = (ad: AdItem) => {
    if (iosIFrame) {
      window.webkit.messageHandlers.productHandler.postMessage(ad.id);
    } else {
      navigate({
        pathname: getAdPathname({
          fromNetworkName: ad.fromCoin.networkName,
          fromTicker: ad.fromCoin.ticker,
          toNetworkName: ad.toCoin.networkName,
          toTicker: ad.toCoin.ticker,
          name: ad.name,
        }),
      });
    }
  };

  const handlePairGroupClick = (fromTicker: string, toTicker: string) => {
    navigate(`?fromToken=${fromTicker}&toToken=${toTicker}`);
  };

  const handleProviderNameChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set('merchant', value);
    } else {
      newSearchParams.delete('merchant');
    }
    setSearchParams(newSearchParams);
  };

  const renderList = flatMap(data?.pages || []);
  const isLoading = isPairGroupsLoading || isAdsLoading;
  const isEmptyResult = data && !isLoading && !isFetching && !renderList.length;
  const pairGroupsMode = !hasQueryParams;

  const hasNextPage =
    (!pairGroupsMode && hasNextAdsPage) ||
    (pairGroupsMode && hasNextPairGroupsPage);

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
          value={providerName || ''}
          data-testid="p2p-ads__search-by-merchant"
          className="flex-grow"
          size="small"
          placeholder={t('Search')}
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
          onChange={(e) => handleProviderNameChange(e.target.value)}
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
        {hasQueryParams ? (
          <TransitionGroup>
            {renderList.map((i) => (
              <Fade key={i.id}>
                <Box data-testid={i.id} marginTop={1} marginBottom={1}>
                  <AdPreview
                    ad={i}
                    fromTokenAmount={Number(fromTokenInputValue)}
                    onClick={() => handleAdPreviewClick(i)}
                  />
                </Box>
              </Fade>
            ))}
          </TransitionGroup>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
            gap={2}
          >
            {pairGroupsData?.pages.map((page) =>
              page.data.map((group) => (
                <PairGroupCard
                  key={`${group.fromTicker}-${group.toTicker}`}
                  group={{
                    fromTicker: group.fromTicker || '',
                    toTicker: group.toTicker || '',
                    total: group.total || 0,
                    officialMerchantCount: group.officialMerchantCount || 0,
                    minTradeAmount: group.minTradeAmount || 0,
                    maxTradeAmount: group.maxTradeAmount || 0,
                    maxReserve: group.maxReserve || 0,
                  }}
                  onClick={() =>
                    handlePairGroupClick(
                      group.fromTicker || '',
                      group.toTicker || '',
                    )
                  }
                />
              )),
            )}
          </Box>
        )}

        <InView
          onChange={(inView) => {
            if (inView) {
              if (pairGroupsMode && hasNextPage) {
                fetchNextPairGroupsPage();
              } else if (!pairGroupsMode && hasNextPage) {
                fetchNextPage();
              }
            }
          }}
        >
          {isLoading || (hasNextPage && !isEmptyResult) ? (
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
