import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { CopyData } from 'dex-ui';
import React from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useQuery } from '../../hooks/use-query';
import { Address } from '../../services';
import { ICurrency } from '../../types';
import ItemRow from '../ui/ItemRow';

export default function WalletDepositAddress({
  currency,
}: {
  currency: ICurrency;
}) {
  const auth = useAuth();
  const generateAddress = useQuery(Address.generate, [
    { projectId: auth.user?.project.id, vaultId: auth.vaults.hotWallet.id },
    { currency_id: currency.id },
  ]);

  const addressData = generateAddress.data;

  if (!addressData) {
    return (
      <Box>
        <Stack spacing={1}>
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={200} />
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
