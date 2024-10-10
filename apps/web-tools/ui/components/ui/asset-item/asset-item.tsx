import { Box, Skeleton, Typography } from '@mui/material';
import { getCoinIconByUid } from 'dex-helpers';
import { AssetModel, CoinModel } from 'dex-helpers/types';
import { UrlIcon } from 'dex-ui';
import React from 'react';

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
            <Typography>{ticker}</Typography>
            <Typography color="text.secondary" variant="body2">
              {networkType}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AssetItem;
