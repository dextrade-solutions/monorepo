import { BoxProps, Box, Typography } from '@mui/material';
import { relativeFromCurrentDate } from 'dex-helpers';

import UserAvatar from '../../ui/user-avatar';
import { RatingOutput } from '../rating-output';
import VerifiedIcon from './verified-icon';

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
    <Box {...boxProps}>
      <Box marginBottom={1} display="flex" alignItems="center">
        <UserAvatar name={name} icon={avatarUrl} online={isActive} />
        <Box marginLeft={2} textAlign="left">
          <Box display="flex" alignItems="center">
            <Typography marginRight={1} fontWeight="bold">
              {name}
            </Typography>
            {isKycVerified && <VerifiedIcon />}
          </Box>
          <Box display="flex" alignItems="center">
            {isSelfAd && (
              <Typography color="primary.main" variant="caption">
                My ad
              </Typography>
            )}
            {!isActive && lastActive && (
              <Typography variant="body2">
                Active {relativeFromCurrentDate(lastActive)}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {rating && <RatingOutput {...rating} />}
    </Box>
  );
}
