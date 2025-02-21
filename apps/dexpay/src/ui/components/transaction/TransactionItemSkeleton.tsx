import { Box, Card, CardContent, Skeleton, Divider } from '@mui/material';
import React from 'react';

export default function TransactionItemSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        marginTop: 2,
        bgcolor: 'primary.light',
        borderRadius: 1,
      }}
    >
      <CardContent>
        <Box display="flex">
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box>
            <Skeleton height={20} width={100} />
            <Skeleton height={16} width={80} sx={{ mt: 1 }} />
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Skeleton height={20} width="60%" />
        <Box mt={1}>
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="80%" sx={{ mt: 1 }} />
          <Skeleton height={16} width="60%" sx={{ mt: 1 }} />
        </Box>
        <Divider sx={{ my: 1 }} />
        <Skeleton height={20} width="50%" />
        <Skeleton height={16} width="30%" sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}
