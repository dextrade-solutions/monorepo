import { BoxProps, Box, Tooltip, Typography } from '@mui/material';
import { relativeFromCurrentDate } from 'dex-helpers';

import UserAvatar from '../../ui/user-avatar';
import { RatingOutput } from '../rating-output';
import OfficialIcon from './official-icon';
import VerifiedIcon from './verified-icon';

export default function ExchangerUserPreview({
  name,
  avatarUrl,
  isActive,
  isSelfAd,
  isOfficial,
  isKycVerified,
  lastActive,
  rating,
  ...boxProps
}: {
  name: string;
  avatarUrl: string | null;
  isOfficial: boolean;
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
      <Box paddingRight={2} display="flex" alignItems="center">
        <UserAvatar
          name={name}
          icon={avatarUrl}
          isOfficial={isOfficial}
          online={isActive}
        />
        <Box marginLeft={2} textAlign="left">
          <Box display="flex" alignItems="center">
            <Typography
              marginRight={1}
              fontWeight="bold"
              color={isOfficial && 'white'}
            >
              {name}
            </Typography>
            {!isOfficial && isKycVerified && (
              <Tooltip placement="top" title="KYC Verified">
                <Box>
                  <VerifiedIcon />
                </Box>
              </Tooltip>
            )}
            {isOfficial && (
              <Tooltip placement="top" title="Is official merchant">
                <Box display="flex" alignItems="center">
                  <OfficialIcon />
                  <Typography marginLeft={1}>Official</Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
          <Box display="flex" alignItems="center">
            {isSelfAd && (
              <Typography color="primary.main" variant="caption">
                My ad
              </Typography>
            )}
            {!isActive && lastActive && (
              <Typography variant="body2" color="text.secondary">
                Active {relativeFromCurrentDate(lastActive)}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {rating && (
        <Box marginTop={1}>
          <RatingOutput {...rating} />
        </Box>
      )}
      {/* </> */}
      {/* )} */}
    </Box>
  );
}
