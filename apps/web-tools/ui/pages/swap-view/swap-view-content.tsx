import {
  Alert,
  Box,
  Card,
  CardContent,
  Skeleton,
  Typography,
} from '@mui/material';
import { AdItem, AssetModel } from 'dex-helpers/types';
import React from 'react';

import P2PSwapView from '../../components/app/p2p-swap-view';
import { useI18nContext } from '../../hooks/useI18nContext';

// Define the type for the props of SwapViewContent
export interface SwapViewContentProps {
  ad: AdItem | null;
  assetFrom: AssetModel;
  assetTo: AssetModel;
  isLoading: boolean;
}

export const SwapViewContent = ({
  ad,
  assetFrom,
  assetTo,
  isLoading,
  isRefetching,
}: SwapViewContentProps) => {
  const t = useI18nContext();

  if (!ad || isLoading) {
    return (
      <>
        <Box marginBottom={2}>
          <Typography
            variant="body2"
            color="text.secondary"
            marginBottom={1}
            marginLeft={1}
          >
            {t('youGive')}
          </Typography>
          <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <Skeleton variant="circular" height={40} width={40} />
                <Box marginLeft={1}>
                  <Skeleton width={40} />
                  <Skeleton width={60} />
                </Box>
              </Box>
              <Skeleton />
            </CardContent>
          </Card>
        </Box>
        <Box marginBottom={2}>
          <Typography
            variant="body2"
            color="text.secondary"
            marginBottom={1}
            marginLeft={1}
          >
            {t('youGet')}
          </Typography>
          <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <Box display="flex" alignItems="center" marginBottom={2}>
                <Skeleton variant="circular" height={40} width={40} />
                <Box marginLeft={1}>
                  <Skeleton width={40} />
                  <Skeleton width={60} />
                </Box>
              </Box>
              <Skeleton />
            </CardContent>
          </Card>
        </Box>
        <Skeleton width="100%" height={50} />
        <Skeleton width="80%" height={50} />
        <Skeleton width="30%" height={50} />
      </>
    );
  }

  if (ad) {
    return (
      <P2PSwapView
        ad={ad}
        assetFrom={assetFrom}
        assetTo={assetTo}
        isRefetching={isRefetching}
      />
    );
  }

  return (
    <Alert color="info">
      Ad not found. The merchant either disabled it or exhausted their balance.
      Try again later.
    </Alert>
  );
};
