import { BoxProps, Box, Typography } from '@mui/material';
import { relativeFromCurrentDate } from 'dex-helpers';

import { Icon, UrlIcon } from '../../ui';
import { RatingOutput } from '../ad-preview/rating-output';

export default function ExchangerUserPreview({
  name,
  avatarUrl,
  isActive,
  isSelfAd,
  isKycVerified,
  lastActive,
  rating,
  ...boxProps
}: {
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  lastActive?: number;
  isSelfAd?: boolean;
  isKycVerified?: boolean;
  rating: {
    exchangeCount: number;
    сompletionRate: number;
    totalRating: number;
  };
} & BoxProps) {
  return (
    <Box display="flex" alignItems="center" {...boxProps}>
      <UrlIcon size={40} url={avatarUrl} />
      <Box marginLeft={2} textAlign="left">
        <Box display="flex" alignContent="center">
          <Typography fontWeight="bold">{name}</Typography>
          {isKycVerified && (
            <Icon marginLeft={2} name="verified" color="primary" />
          )}
        </Box>
        <Box display="flex" alignItems="center">
          {isSelfAd && (
            <Typography color="primary.main" variant="caption">
              My ad
            </Typography>
          )}
          {!isSelfAd && isActive && (
            <Typography variant="body2" color="success.main">
              Online
            </Typography>
          )}
          {!isActive && lastActive && (
            <Typography variant="body2">
              Active {relativeFromCurrentDate(lastActive)}
            </Typography>
          )}
        </Box>
        {rating && <RatingOutput {...rating} />}
      </Box>
    </Box>
  );
}
