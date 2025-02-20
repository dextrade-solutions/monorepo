import { Box, Divider, Stack, Skeleton, Paper } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import React from 'react';

const AdItemSkeleton = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        my: 1,
        p: 2,
        bgcolor: 'secondary.dark',
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <Skeleton variant="text" width={100} />
        <Box ml="auto" display="flex">
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="circular" width={24} height={24} sx={{ mx: 1 }} />
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
      </Box>
      <Divider />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        my={2}
      >
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton
          variant="circular"
          width={24}
          height={24}
          sx={{ mx: 'auto', position: 'absolute', left: 0, right: 0 }}
        />{' '}
        {/* Centered circular skeleton */}
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
      <Divider />

      <Box display="flex" justifyContent="center" mt={1} width="100%">
        <ChevronDown /> {/* No need for a skeleton for the static icon */}
      </Box>
    </Paper>
  );
};

export default AdItemSkeleton;
