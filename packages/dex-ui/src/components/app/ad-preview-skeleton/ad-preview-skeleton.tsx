import {
  Box,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';

import AssetItem from '../../ui/asset-item';
import Icon from '../../ui/icon';

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
        <Box marginY={1}>
          <Divider />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <AssetItem loading />
          <Icon name="exchange-direction" size="xl" />
          <AssetItem loading alignReverse />
        </Box>
        <Box marginY={1}>
          <Divider />
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Skeleton height={50} width={60} />
          <Skeleton width={150} />
        </Box>
        <Box
          marginTop={1}
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Box>
            <Typography color="text.secondary">Price</Typography>
            <Skeleton width={150} />
          </Box>
          <Box>
            <Typography color="text.secondary">Reserve</Typography>
            <Box display="flex" alignItems="center">
              <Skeleton width={150} />
            </Box>
          </Box>
          <Box display="flex" alignItems="center">
            <Skeleton width={50} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
