import { Box, Typography } from '@mui/material';
import React from 'react';

import { AssetListItem } from './AssetListItem';
import { useCurrencies } from '../../hooks/use-currencies';

export default function AssetList() {
  const { items, isLoading } = useCurrencies();

  if (isLoading) {
    return <Typography>Loading...</Typography>; // Or a loading indicator component
  }

  if (items.length === 0) {
    return <Typography>No assets found.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item) => (
        <AssetListItem key={item.currency.name} {...item} />
      ))}
    </Box>
  );
}
