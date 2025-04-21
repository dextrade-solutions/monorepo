import { BoxProps, Box, Tooltip, Typography } from '@mui/material';
import { relativeFromCurrentDate } from 'dex-helpers';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

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
  endAdornment,
  ...boxProps
}: {
  name: string;
  avatarUrl: string | null;
  isOfficial: boolean;
  isActive: boolean;
  lastActive?: number;
  isSelfAd?: boolean;
  isKycVerified?: boolean;
  endAdornment?: ReactNode;
  rating: {
    exchangeCount: number;
    сompletionRate: number;
    totalRating: number;
  };
} & BoxProps) {
  const { t } = useTranslation();
  return (
    <Box {...boxProps}>
      <Box display="flex" alignItems="center">
        <UserAvatar
          name={name}
          icon={avatarUrl}
          isOfficial={isOfficial}
          online={isActive}
        />
        <Box marginLeft={2} width="100%" textAlign="left">
          <Box display="flex" alignItems="center">
            <Typography marginRight={1} fontWeight="bold">
              {name}
            </Typography>
            {!isOfficial && isKycVerified && (
              <Tooltip placement="top" title={t('kycVerified')}>
                <Box display="flex">
                  <VerifiedIcon />
                </Box>
              </Tooltip>
            )}
            {isOfficial && (
              <Tooltip placement="top" title={t('officialMerchant')}>
                <Box display="flex" alignItems="center">
                  <OfficialIcon />
                  <Typography marginLeft={1}>{t('official')}</Typography>
                </Box>
              </Tooltip>
            )}
            {endAdornment}
          </Box>
          <Box display="flex" alignItems="center">
            {isSelfAd && (
              <Typography color="primary.main" variant="caption">
                {t('myAd')}
              </Typography>
            )}
            {!isActive && lastActive && (
              <Typography variant="body2" color="text.secondary">
                {t('active')} {relativeFromCurrentDate(lastActive)}
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
    </Box>
  );
}
