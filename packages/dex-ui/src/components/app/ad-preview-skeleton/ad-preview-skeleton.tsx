import { Box, Card, CardContent, Skeleton } from '@mui/material';

export default function AdPreviewSkeleton() {
  return (
    <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
      <CardContent>
        <Box display="flex">
          <Skeleton variant="circular" width={25} height={25} />
          <Box marginLeft={2}>
            <Skeleton width={150} />
          </Box>
        </Box>
        <Box display="flex" alignItems="flex-end">
          <Skeleton width={160} />
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignContent="center"
        >
          <Skeleton width={70} height={40} />
          <Skeleton width={160} height={40} />
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignContent="center"
        >
          <Skeleton width={70} height={40} />
          <Skeleton width={140} height={40} />
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignContent="center"
        >
          <Skeleton width={70} height={40} />
          <Skeleton width={160} height={40} />
        </Box>
      </CardContent>
    </Card>
  );
}
