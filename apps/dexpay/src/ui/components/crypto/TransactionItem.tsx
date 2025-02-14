import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import { formatCurrency, getCoinIconByUid } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { CopyData, UrlIcon } from 'dex-ui';
import React from 'react';

import { ITransaction } from '../../types';

interface TransactionItemProps {
  transaction: ITransaction;
  asset: AssetModel;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  asset,
}) => {
  const currencyIso = asset.symbol || 'Unknown_currency'; // Fallback to BNB if currency is not available

  return (
    <Card
      key={transaction.id}
      elevation={0}
      sx={{
        marginTop: 2,
        bgcolor: 'primary.light',
        borderRadius: 1,
      }}
    >
      <CardContent>
        <Box display="flex">
          <UrlIcon url={getCoinIconByUid(asset.uid)} size={40} sx={{ mr: 2 }} />
          <Box ml={2}>
            <Typography variant="body1" fontWeight="bold">
              + {formatCurrency(transaction.amount, currencyIso)}
            </Typography>
            {transaction.network_fee && (
              <Typography variant="body2" color="text.secondary">
                Network Fee:{' '}
                {formatCurrency(transaction.network_fee, currencyIso)}
              </Typography>
            )}
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" alignItems="center">
          <Typography variant="body1">Hash:</Typography>
          <CopyData data={transaction.txid} />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Date: {new Date(transaction.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            From: {transaction.from_address}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            To: {transaction.to_address}
          </Typography>
          {transaction.to_tag && (
            <Typography variant="body2" color="text.secondary">
              Tag/Memo: {transaction.to_tag}
            </Typography>
          )}
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box>
          <Typography variant="body1">
            Status: {transaction.status === 3 ? 'Confirmed' : 'Pending'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Confirmations: {transaction.confirmations}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionItem;
