import { Box, Typography } from '@mui/material';
import React from 'react';

import Icon from '../ui/icon';

export const RatingOutput = ({
  сompletionRate,
  exchangeCount,
  totalRating,
}: {
  сompletionRate: number;
  exchangeCount: number;
  totalRating: number;
}) => {
  const totalRatingPercent = (totalRating * 100).toFixed(0);
  const exchangeCompletionRatePercent = (сompletionRate * 100).toFixed(0);
  return (
    <Box display="flex" alignItems="center">
      <Typography variant="body2">Trades {exchangeCount}</Typography>
      <Typography marginX={1}>|</Typography>
      <Typography variant="body2">
        Completion {exchangeCompletionRatePercent}%
      </Typography>
      <Typography marginX={1}>|</Typography>
      <Icon size="xs" name="thumb-up" marginRight={0.5} />
      <Typography marginRight={1} variant="body2">
        {totalRatingPercent}%
      </Typography>
    </Box>
  );
};
