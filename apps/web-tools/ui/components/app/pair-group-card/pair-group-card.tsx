import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import { formatCurrency, formatFundsAmount } from 'dex-helpers';
import { AssetItem, Icon } from 'dex-ui';
import React from 'react';

import { getAssetByIso } from '../../../../app/helpers/p2p';
import { AssetModel } from 'dex-helpers/types';

interface PairGroup {
  fromTicker: string;
  toTicker: string;
  total: number;
  officialMerchantCount: number;
  minTradeAmount: number;
  maxTradeAmount: number;
  maxReserve: number;
}

interface IProps {
  group: PairGroup;
  onClick: () => void;
}

export const PairGroupCard = ({ group, onClick }: IProps) => {
  const fromAsset = getAssetByIso(group.fromTicker);
  const toAsset = getAssetByIso(group.toTicker);

  const renderFromAsset = (asset?: AssetModel) => {
    if (!asset) {
      return <Typography>{group.fromTicker}</Typography>;
    }
    return <AssetItem asset={asset} />;
  };

  const renderToAsset = (asset?: AssetModel) => {
    if (!asset) {
      return <Typography>{group.toTicker}</Typography>;
    }
    return <AssetItem asset={asset} />;
  };
  return (
    <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" marginBottom={1}>
            <Typography color="success.main">{group.total} ads</Typography>
          </Box>

          <Box marginTop={1} marginBottom={1}>
            <Divider />
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {renderFromAsset(fromAsset)}
            <Icon name="exchange-direction" size="xl" />
            {renderToAsset(toAsset)}
          </Box>

          <Box marginTop={1} marginBottom={1}>
            <Divider />
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
          >
            <Typography>Trade Limits</Typography>
            <Typography fontWeight="bold">
              {formatFundsAmount(group.minTradeAmount || 0)} —{' '}
              {formatCurrency(group.maxTradeAmount || 0, group.toTicker)}
            </Typography>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
          >
            <Typography>Max Reserve</Typography>
            <Typography fontWeight="bold">
              {formatCurrency(group.maxReserve || 0, group.toTicker)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
