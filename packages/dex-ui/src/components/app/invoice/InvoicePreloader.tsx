import { Box, Skeleton } from '@mui/material';
import React from 'react';

import { DexLoader } from '../../ui';

export default function InvoicePreloader({
  preloaderType,
}: {
  preloaderType?: 'skeleton' | 'dextrade';
}) {
  if (preloaderType === 'skeleton') {
    return (
      <Box width="100%" p={3}>
        <Box display="flex" alignItems="center" flexDirection="column" mb={2}>
          <Skeleton variant="circular" width={50} height={50} />
          <Skeleton
            variant="text"
            width="50%"
            sx={{ fontSize: '1rem', mt: 1 }}
          />
          <Skeleton
            variant="text"
            width="70%"
            sx={{ fontSize: '1rem', mt: 1 }}
          />
        </Box>
        <Skeleton width="100%" height={50} sx={{ mb: 2 }} />
        <Skeleton width="100%" height={50} sx={{ mb: 2 }} />
        <Skeleton width="100%" height={50} sx={{ mb: 2 }} />
        <Skeleton width="100%" height={50} sx={{ mb: 2 }} />
      </Box>
    );
  }
  return <DexLoader sx={{ height: '90vh' }} />;
}
