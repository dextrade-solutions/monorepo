import { Box, Typography } from '@mui/material';
import { queryClient } from 'dex-helpers/shared';
import { useForm, useGlobalModalContext } from 'dex-ui';
import { Pause, Play, TrashIcon } from 'lucide-react';
import React from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useMutation } from '../../hooks/use-query';
import { DexTrade } from '../../services';
import { IAdvert } from '../../types';

export const useAdvertActions = () => {
  const { user } = useAuth();
  const projectId = user?.project?.id!;
  const { showModal } = useGlobalModalContext();

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
      if (!previousAds) {
        return { previousAds };
      }
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
                maximumExchangeAmountCoin1: ad.details
                  .maximumExchangeAmountCoin1
                  ? String(ad.details.maximumExchangeAmountCoin1)
                  : null,
              },
            },
          ]),
      };
      await ACTIONS[action]();
    },
  });

  const handleDelete = (ad: IAdvert) => {
    return new Promise<void>((resolve, reject) => {
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
        onConfirm: () => form.submit(ad, 'delete').then(resolve),
        hideModal: () => {
          reject(new Error('Operation cancelled'));
        },
      });
    });
  };

  const toggleActive = (ad: IAdvert) => {
    const isActive = ad.details.active;
    return new Promise<void>((resolve, reject) => {
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
        onConfirm: async () => form.submit(ad, 'toggleActive').then(resolve),
        hideModal: () => {
          reject(new Error('Operation cancelled'));
        },
      });
    });
  };

  return {
    handleDelete,
    toggleActive,
  };
};
