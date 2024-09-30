import { Box, Typography } from '@mui/material';
import React from 'react';

import Icon from '../../ui/icon';

export const RatingOutput = ({
  exchangeCompletionRate,
  exchangeCount,
  totalRating,
}: {
  exchangeCompletionRate: number;
  exchangeCount: number;
  positive: number;
  negative: number;
  totalRating: number;
}) => {
  const totalRatingPercent = (totalRating * 100).toFixed(0);
  const exchangeCompletionRatePercent = (exchangeCompletionRate * 100).toFixed(
    0,
  );
  return (
    <Box display="flex" alignItems="center">
      <Typography marginRight={1} variant="body2" color="text.secondary">
        Trades {exchangeCount}
      </Typography>
      <Typography marginRight={1} variant="body2" color="text.secondary">
        Completion {exchangeCompletionRatePercent}%
      </Typography>
      <Icon
        size="xs"
        name="thumbs-up-down"
        marginRight={1}
        color="text.secondary"
      />
      <Typography marginRight={1} variant="body2" color="text.secondary">
        {totalRatingPercent}%
      </Typography>
    </Box>
  );
};
