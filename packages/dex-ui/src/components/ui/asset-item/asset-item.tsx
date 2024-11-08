import { Box, Skeleton, Typography } from '@mui/material';
import { getCoinIconByUid } from 'dex-helpers';
import React from 'react';

import UrlIcon from '../url-icon';
import { AssetModel, CoinModel } from 'dex-helpers/types';

interface IProps {
  coin?: CoinModel;
  asset?: AssetModel;
  alignReverse?: boolean;
  loading?: boolean;
  iconSize?: number;
}

const AssetItem = ({
  coin,
  asset,
  alignReverse,
  loading,
  iconSize,
}: IProps) => {
  const reverseProps = alignReverse && {
    textAlign: 'right',
    flexDirection: 'row-reverse',
  };

  const url = getCoinIconByUid(asset?.uid || coin?.uuid);

  const ticker = asset?.symbol || coin?.ticker;

  const networkType = asset?.standard || coin?.networkType;

  return (
    <Box display="flex" alignItems="center" {...(reverseProps || {})}>
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
            <Typography fontWeight={200} variant="body2">
              {networkType?.toUpperCase()}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AssetItem;
