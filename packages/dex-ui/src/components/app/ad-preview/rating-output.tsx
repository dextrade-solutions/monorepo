import { Box, Typography } from '@mui/material';
import React from 'react';

import Icon from '../../ui/icon';

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
      <Typography variant="body2" color="text.secondary">
        Trades {exchangeCount}
      </Typography>
      <Typography color="text.secondary" marginX={1}>
        |
      </Typography>
      <Typography color="text.secondary" variant="body2">
        Completion {exchangeCompletionRatePercent}%
      </Typography>
      <Typography color="text.secondary" marginX={1}>
        |
      </Typography>
      <Icon
        size="xs"
        name="thumb-up"
        marginRight={0.5}
        color="text.secondary"
      />
      <Typography marginRight={1} variant="body2" color="text.secondary">
        {totalRatingPercent}%
      </Typography>
    </Box>
  );
};
