import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { CopyData } from 'dex-ui';
import React from 'react';
import { orderBy } from 'lodash';

import useAddresses from '../../hooks/use-addresses';
import { ICurrency } from '../../types';
import ItemRow from '../ui/ItemRow';

export default function WalletDepositAddress({
  currency,
}: {
  currency: ICurrency;
}) {
  const { items: addressList } = useAddresses({ currencyId: currency.id });

  const [addressData] = orderBy(addressList, 'balance', 'desc');

  if (!addressData) {
    return (
      <Box>
        <Stack spacing={1}>
          <Skeleton variant="text" width={100} /> {/* Network Label Skeleton */}
          <Skeleton variant="text" width={200} /> {/* Network Value Skeleton */}
          <Paper
            elevation={0}
            sx={{ bgcolor: 'secondary.dark', p: 1, width: '100%' }}
          >
            <Skeleton width="100%" height={40} />
          </Paper>
        </Stack>
      </Box>
    );
  }
  return (
    <Box>
      <Stack spacing={1}>
        <ItemRow label="Network" value={currency.network.public_name} />
        {currency.token_type && (
          <ItemRow label="Token type" value={currency.token_type} />
        )}
        <Typography>Recipient address to deposit:</Typography>
        <Paper elevation={0} sx={{ bgcolor: 'secondary.dark', p: 1 }}>
          <CopyData width="100%" data={addressData.address} />
        </Paper>
      </Stack>
    </Box>
  );
}
