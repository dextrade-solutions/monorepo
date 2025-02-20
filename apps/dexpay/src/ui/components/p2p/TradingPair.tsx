import { Box, Typography } from '@mui/material';
import { useForm } from 'dex-ui';
import React from 'react';

import AdItem from './AdItem';
import AdItemSkeleton from './AdItemSkeleton';
import { useAuth } from '../../hooks/use-auth';
import { useMutation, useQuery } from '../../hooks/use-query';
import { DexTrade } from '../../services';

export default function TradingPair() {
  const { user } = useAuth();
  const projectId = user?.project?.id!;

  const ads = useQuery(DexTrade.advertsList, { projectId });
  const deleteAd = useMutation(DexTrade.advertDelete); // Add delete mutation

  const form = useForm({
    // useForm setup
    method: async (_, id: number, dexTradeId: number) => {
      try {
        await deleteAd.mutateAsync([
          { projectId },
          { ad_id: id, dextrade_id: dexTradeId },
        ]); // Call delete API
        // Refetch the ads list after successful deletion
        await ads.refetch();
      } catch (error) {
        // Handle error, e.g., show an error message
        console.error('Error deleting ad:', error);
      }
    },
  });

  const handleDelete = (ad) => {
    form.submit(ad.id, ad.dextrade_id);
  };

  const renderList = ads.data || [];

  return (
    <Box className="space-y-4">
      {ads.isLoading && Array.from({ length: 3 }).map(() => <AdItemSkeleton />)}
      {renderList.map((ad) => (
        <AdItem
          key={ad.details.id}
          fromCoin={ad.details.from}
          toCoin={ad.details.to}
          price={ad.details.coinPair.price}
          profitCommission={ad.details.priceAdjustment}
          priceSource={ad.pair?.rate_source_options.serviceName}
          statusMessage={ad.comment}
          onDelete={() => handleDelete(ad)}
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
