import { Box, Skeleton, Typography } from '@mui/material';
import { getCoinIconByUid } from 'dex-helpers';
import { AssetModel, CoinModel } from 'dex-helpers/types';
import React from 'react';

import UrlIcon from '../url-icon';

interface IProps {
  coin?: CoinModel;
  asset?: AssetModel;
  alignReverse?: boolean;
  loading?: boolean;
  iconSize?: number;
  subtitle?: React.ReactNode;
}

const AssetItem = ({
  coin,
  asset,
  alignReverse,
  loading,
  subtitle,
  iconSize,
}: IProps) => {
  const reverseProps = alignReverse && {
    textAlign: 'right',
    flexDirection: 'row-reverse',
  };
  const url = getCoinIconByUid(asset?.uid || coin?.uuid);

  const ticker = asset?.symbol || coin?.ticker;

  const isBtc = ticker === 'BTC';

  const networkType = asset?.standard || coin?.networkType;

  return (
    <Box
      display="flex"
      textAlign="left"
      alignItems="center"
      {...(reverseProps || {})}
    >
      {loading && (
        <>
          <Skeleton variant="circular" width={25} height={25} />
          <Box marginX={2}>
            <Skeleton width={60} height={45} />
          </Box>
        </>
      )}
      {!loading && (
        <>
          <UrlIcon size={iconSize} url={url} />
          <Box marginX={2}>
            <Typography fontWeight="bold">{ticker}</Typography>
            {!isBtc && (
              <Typography fontWeight={200} variant="body2">
                {networkType?.toUpperCase()}
              </Typography>
            )}
            {subtitle}
          </Box>
        </>
      )}
    </Box>
  );
};

export default AssetItem;
