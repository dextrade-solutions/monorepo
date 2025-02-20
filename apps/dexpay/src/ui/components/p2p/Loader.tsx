import { Box, Paper, Skeleton, Typography } from '@mui/material';
import React from 'react';

export default function Loader() {
  return (
    <Box sx={{ mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{ textAlign: 'center', bgcolor: 'secondary.dark', p: 2, mb: 5 }}
      >
        <Typography variant="body2" color="textSecondary">
          <Skeleton width={100} /> {/* Skeleton for "Total income" */}
        </Typography>
        <Skeleton height={40} width={150} sx={{ margin: '16px 0' }} />{' '}
        {/* Skeleton for total amount */}
        <Box display="flex" gap={2}>
          <Skeleton height={48} width={'100%'} /> {/* Skeleton for button */}
        </Box>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Skeleton width={150} />
      </Box>

      <Box mt={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Skeletons for the trading pairs */}
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={80} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
