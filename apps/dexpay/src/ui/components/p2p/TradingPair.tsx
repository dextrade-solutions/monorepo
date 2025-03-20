import { Box, Typography } from '@mui/material';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useGlobalModalContext } from 'dex-ui';
import { Pause, Play, TrashIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import AdItem from './AdItem';
import AdItemSkeleton from './AdItemSkeleton';
import { useAuth } from '../../hooks/use-auth';
import { useMutation } from '../../hooks/use-query';
import { DexTrade } from '../../services';
import { IAdvert } from '../../types';

export default function TradingPair() {
  const { user } = useAuth();
  const projectId = user?.project?.id!;
  const queryClient = useQueryClient();

  const { showModal } = useGlobalModalContext();

  const { ref: intersectionRef, inView } = useInView({
    threshold: 0.5,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
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

  const deleteAd = useMutation(DexTrade.advertDelete, {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['ads-list'] });
      const previousAds = queryClient.getQueryData(['ads-list']);
      queryClient.setQueryData(['ads-list'], (oldData: any) => {
        const adToDelete = variables[1];
        if (adToDelete && adToDelete.ad_id) {
          const newData = oldData?.pages.map((page: any) => ({
            ...page,
            currentPageResult: page.currentPageResult.filter(
              (ad: IAdvert) => ad.id !== adToDelete.ad_id,
            ),
          }));
          return {
            ...oldData,
            pages: newData,
          };
        }
        return oldData;
      });
      return { previousAds };
    },
    onError: (_err, _newTodo, context: any) => {
      queryClient.setQueryData(['ads-list'], context.previousAds);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ads-list'] });
    },
  });
  const updateAd = useMutation(DexTrade.advertUpdate, {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['ads-list'] });
      const previousAds = queryClient.getQueryData(['ads-list']);
      queryClient.setQueryData(['ads-list'], (oldData: any) => {
        const adToUpdate = variables[1];
        if (adToUpdate && adToUpdate.dextrade_id) {
          const newData = oldData?.pages.map((page: any) => ({
            ...page,
            currentPageResult: page.currentPageResult.map((ad: IAdvert) => {
              if (ad.details.id === adToUpdate.dextrade_id) {
                return {
                  ...ad,
                  details: {
                    ...ad.details,
                    active: adToUpdate.settingsMain.active,
                  },
                };
              }
              return ad;
            }),
          }));
          return {
            ...oldData,
            pages: newData,
          };
        }
        return oldData;
      });
      return { previousAds };
    },
    onError: (_err, _newTodo, context: any) => {
      queryClient.setQueryData(['ads-list'], context.previousAds);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ads-list'] });
    },
  });

  const form = useForm({
    method: async (_, ad: IAdvert, action: 'delete' | 'toggleActive') => {
      const ACTIONS = {
        delete: () =>
          deleteAd.mutateAsync([
            { projectId },
            { ad_id: ad.id, dextrade_id: ad.details.id },
          ]),
        toggleActive: () =>
          updateAd.mutateAsync([
            { projectId },
            {
              dextrade_id: ad.details.id,
              settingsMain: {
                active: !ad.details.active,
              },
            },
          ]),
      };
      await ACTIONS[action]();
    },
  });

  const handleDelete = (ad: IAdvert) => {
    showModal({
      name: 'CONFIRM_MODAL',
      title: (
        <Box display="flex" alignItems="center">
          <TrashIcon size={40} />
          <Typography variant="h5" ml={2}>
            Remove ad
          </Typography>
        </Box>
      ),
      onConfirm: () => form.submit(ad, 'delete'),
    });
  };
  const toggleActive = (ad: IAdvert) => {
    const isActive = ad.details.active;
    showModal({
      name: 'CONFIRM_MODAL',
      title: (
        <Box display="flex" alignItems="center">
          {isActive ? <Pause size={40} /> : <Play size={40} />}
          <Typography variant="h5" ml={2}>
            {isActive ? 'Stop ad' : 'Start ad'}
          </Typography>
        </Box>
      ),
      onConfirm: () => form.submit(ad, 'toggleActive'),
    });
  };

  // Extract the 'data' array from the response. Assume your API returns {data: [], total: number}
  const renderList = (
    data?.pages.flatMap((i) => i.currentPageResult) || []
  ).filter((ad) => ad.details.direction === 2);

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
              fromCoin={ad.details.from}
              toCoin={ad.details.to}
              price={ad.details.coinPair.price}
              minimumExchangeAmountCoin1={ad.details.minimumExchangeAmountCoin1}
              maximumExchangeAmountCoin1={ad.details.maximumExchangeAmountCoin1}
              profitCommission={ad.details.priceAdjustment}
              priceSource={ad.pair?.rate_source_options.serviceName}
              // statusMessage={ad.comment} TODO: Add message if balance is not correct
              exchangerName={ad.dextrade_user.username}
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
