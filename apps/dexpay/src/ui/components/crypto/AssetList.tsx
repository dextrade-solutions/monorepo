import { Box, Typography } from '@mui/material';
import React from 'react';

import { AssetListItem } from './AssetListItem';

export default function AssetList({ items }: { items: any[] }) {
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
