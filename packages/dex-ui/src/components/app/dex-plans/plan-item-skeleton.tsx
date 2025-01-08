import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Typography,
} from '@mui/material';

export function PlanItemSkeleton() {
  return (
    <Card
      sx={{
        boxShadow: 'none',
        bgcolor: 'primary.light',
      }}
    >
      <CardActionArea>
        <Box padding={1}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              marginBottom={3}
            >
              <Typography marginBottom={1} variant="h6" fontWeight="bold">
                <Skeleton  width={100} />
              </Typography>

              <Skeleton width={50} height={40} />
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Skeleton width={120} />
              <Skeleton width={30} />
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Skeleton width={100} />
              <Skeleton width={30} />
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Skeleton width={150} />
              <Skeleton width={30} />
            </Box>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}
