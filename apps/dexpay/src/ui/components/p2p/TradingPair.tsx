import { Box, Typography } from '@mui/material';
import { useForm, useGlobalModalContext } from 'dex-ui';
import { Pause, Play, TrashIcon } from 'lucide-react';
import React from 'react';

import AdItem from './AdItem';
import AdItemSkeleton from './AdItemSkeleton';
import { useAuth } from '../../hooks/use-auth';
import { useMutation, useQuery } from '../../hooks/use-query';
import { DexTrade } from '../../services';
import { IAdvert } from '../../types';

export default function TradingPair() {
  const { user } = useAuth();
  const projectId = user?.project?.id!;

  const { showModal } = useGlobalModalContext();

  const ads = useQuery(DexTrade.advertsList, { projectId });
  const deleteAd = useMutation(DexTrade.advertDelete); // Add delete mutation
  const updateAd = useMutation(DexTrade.advertUpdate); // Add update mutation

  const form = useForm({
    // useForm setup
    method: async (_, ad: IAdvert, action: 'delete' | 'toggleActive') => {
      const ACTIONS = {
        delete: () =>
          deleteAd.mutateAsync([
            { projectId },
            { ad_id: ad.id, dextrade_id: ad.dextrade_id },
          ]),
        toggleActive: () =>
          updateAd.mutateAsync([
            { projectId },
            {
              dextrade_id: ad.dextrade_id,
              settingsMain: {
                active: !ad.details.active,
              },
            },
          ]),
      };
      await ACTIONS[action]();
      ads.refetch();
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
  const renderList = ads.data || [];

  if (ads.isLoading) {
    return Array.from({ length: 3 }).map(() => <AdItemSkeleton />);
  }

  return (
    <Box>
      {renderList.map((ad) => (
        <AdItem
          key={ad.details.id}
          fromCoin={ad.details.from}
          toCoin={ad.details.to}
          price={ad.details.coinPair.price}
          profitCommission={ad.details.priceAdjustment}
          priceSource={ad.pair?.rate_source_options.serviceName}
          statusMessage={ad.comment}
          exchangerName={ad.dextrade_user.username}
          onDelete={() => handleDelete(ad)}
          toggleActive={() => toggleActive(ad)}
          active={ad.details.active}
        />
      ))}
      {renderList.length === 0 && (
        <Typography textAlign="center" color="text.secondary">
          No created ads found. Create your first
        </Typography>
      )}
    </Box>
  );
}
