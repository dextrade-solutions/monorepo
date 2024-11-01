import { Box, Skeleton, Typography } from '@mui/material';
import { getCoinIconByUid } from 'dex-helpers';
import React from 'react';

import UrlIcon from '../url-icon';

interface IProps {
  coin?: any;
  alignReverse?: boolean;
  loading?: boolean;
  iconSize?: number;
}

const AssetItem = ({ coin, alignReverse, loading, iconSize }: IProps) => {
  const reverseProps = alignReverse && {
    textAlign: 'right',
    flexDirection: 'row-reverse',
  };

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
      {coin && !loading && (
        <>
          <UrlIcon size={iconSize} url={getCoinIconByUid(coin.uuid)} />
          <Box marginX={2}>
            <Typography fontWeight="bold">{coin.ticker}</Typography>
            <Typography variant="body2">{coin.networkType}</Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AssetItem;
