import { BoxProps, Box, Tooltip, Typography } from '@mui/material';
import { relativeFromCurrentDate } from 'dex-helpers';

import UserAvatar from '../../ui/user-avatar';
import { RatingOutput } from '../rating-output';
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
    <Box
      {...boxProps}
      sx={
        isOfficial
          ? {
              background: 'linear-gradient(-68deg, #00C283 12%, #3C76FF 87%);',
              borderRadius: 1,
              padding: '3px',
            }
          : {}
      }
    >
      {isOfficial ? (
        <Typography paddingX={2} color="white" fontSize={14}>
          Official merchant
        </Typography>
      ) : (
        <>
          <Box marginBottom={1} display="flex" alignItems="center">
            <UserAvatar
              name={name}
              icon={avatarUrl}
              isOfficial={isOfficial}
              online={isActive}
            />
            <Box marginLeft={2} textAlign="left">
              <Box display="flex" alignItems="center">
                <Typography marginRight={1} fontWeight="bold">
                  {name}
                </Typography>
                {isKycVerified && (
                  <Tooltip placement="top" title="KYC Verified">
                    <VerifiedIcon />
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
          {rating && <RatingOutput {...rating} />}
        </>
      )}
    </Box>
  );
}
