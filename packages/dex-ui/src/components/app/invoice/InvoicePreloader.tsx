import { Box, Skeleton, Divider, MenuList } from '@mui/material';
import React from 'react';

export default function InvoicePreloader() {
  return (
    <Box>
      {/* Header Skeleton */}
      <Box display="flex" justifyContent="space-between">
        <Skeleton width={120} height={50} />
        <Skeleton width={120} height={50} />
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        <Skeleton width={40} height={60} />
        <Skeleton width={120} height={24} />
      </Box>

      {/* Payment Section Skeleton */}
      <Box
        m={1}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Skeleton width={80} />
        <Skeleton width={100} height={50} />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Payment Method and Wallet Selection Skeleton */}
      <Box>
        <Skeleton width={120} height={30} />
        <MenuList>
          <Skeleton height={90} />
          <Skeleton height={90} />
          <Skeleton height={90} />
        </MenuList>
      </Box>
    </Box>
  );
}
