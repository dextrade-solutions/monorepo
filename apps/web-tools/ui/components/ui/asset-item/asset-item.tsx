import { Box, Skeleton, Typography } from '@mui/material';
import React from 'react';

import { CoinModel } from '../../../../app/types/p2p-swaps';
import { getCoinIconByUid } from '../../../helpers/utils/tokens';
import UrlIcon from '../url-icon';

interface IProps {
  coin?: CoinModel;
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
            <Typography>{coin.ticker}</Typography>
            <Typography color="text.secondary" variant="body2">
              {coin.networkType}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AssetItem;
