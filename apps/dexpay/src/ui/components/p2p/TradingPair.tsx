import { Box, Typography } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import AdItem from './AdItem';
import AdItemSkeleton from './AdItemSkeleton';
import { useAdvertActions } from './useAdvertActions';
import { useAuth } from '../../hooks/use-auth';
import { DexTrade } from '../../services';

export default function TradingPair() {
  const { user } = useAuth();
  const projectId = user?.project?.id!;
  const { handleDelete, toggleActive } = useAdvertActions();

  const { ref: intersectionRef, inView } = useInView({
    threshold: 0.5,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['ads-list'],
      queryFn: ({ pageParam = 0 }) =>
        DexTrade.advertsList(
          { projectId },
          { no_pagination: 0, page: pageParam },
        ),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.page >= lastPage.totalPages - 1) {
          return undefined;
        }
        return lastPage.page + 1;
      },
    });

  // Extract the 'data' array from the response. Assume your API returns {data: [], total: number}
  const renderList = (
    data?.pages.flatMap((i) => i.currentPageResult) || []
  ).filter((ad) => ad?.details?.direction === 2 || ad?.details.active);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return Array.from({ length: 3 }).map((_, index) => (
      <AdItemSkeleton key={index} />
    ));
  }
  return (
    <Box>
      {renderList.map((ad, index) => {
        const lastElement = renderList.length - 1 === index;
        return (
          <Box ref={lastElement ? intersectionRef : undefined} key={index}>
            <AdItem
              advert={ad}
              fromCoin={ad.details.from}
              toCoin={ad.details.to}
              price={ad.details.coinPair.price}
              minimumExchangeAmountCoin1={ad.details.minimumExchangeAmountCoin1}
              maximumExchangeAmountCoin1={ad.details.maximumExchangeAmountCoin1}
              profitCommission={ad.details.priceAdjustment}
              priceSource={ad.pair?.rate_source_options?.serviceName || '-'}
              // statusMessage={ad.comment} TODO: Add message if balance is not correct
              exchangerName={ad.dextrade_user?.username}
              onDelete={() => handleDelete(ad)}
              toggleActive={() => toggleActive(ad)}
              active={ad.details.active}
              reversed
            />
          </Box>
        );
      })}
      {renderList.length === 0 && (
        <Typography textAlign="center" color="text.secondary">
          No created ads found. Create your first
        </Typography>
      )}
      {isFetchingNextPage && <AdItemSkeleton />}
    </Box>
  );
}
