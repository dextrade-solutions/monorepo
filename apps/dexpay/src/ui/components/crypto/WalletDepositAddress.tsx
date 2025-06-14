import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Button, CopyData } from 'dex-ui';
import React, { useEffect } from 'react';

import { useAuth } from '../../hooks/use-auth';
import { useQuery } from '../../hooks/use-query';
import { Address, Transaction } from '../../services';
import { ICurrency } from '../../types';
import ItemRow from '../ui/ItemRow';

const USDT_OPTIONS = ['USDT_ETH', 'USDT_TRX', 'USDT_BSC', 'USDT_SOL'];

export default function WalletDepositAddress({
  currency,
}: {
  currency: ICurrency;
}) {
  const auth = useAuth();

  const generateAddress = useQuery(Address.generate, [
    { projectId: auth.user?.project?.id, vaultId: auth.vaults.hotWallet?.id },
    { currency_id: currency.id },
  ]);

  const setTransferFrom = async () => {
    await Transaction.transferFromRequest(
      { projectId: auth.user?.project?.id },
      { address_id: generateAddress?.data?.id },
    );

    generateAddress.refetch();
  };

  useEffect(() => {
    if (
      generateAddress.data?.id &&
      auth.user?.project?.id &&
      history.state?.transfer_from === 'true'
    ) {
      setTransferFrom();
      history.replaceState({}, '');
    }
  }, [generateAddress.data, auth.user?.project?.id]);

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
      <Stack spacing={1} sx={{ mb: 2 }}>
        <ItemRow label="Network" value={currency?.network?.public_name} />
        {currency.token_type && (
          <ItemRow label="Token type" value={currency?.token_type} />
        )}

        {Boolean(
          generateAddress.data?.transfer_from &&
            generateAddress.data?.transfer_from.is_pending,
        ) && (
          <Typography color="error">
            <b>
              Please deposit to the following wallet in order to use this token
              for gas fees
            </b>{' '}
            <i>(when native token is insufficient)</i>
          </Typography>
        )}

        {Boolean(
          generateAddress.data?.transfer_from &&
            generateAddress.data?.transfer_from.is_done,
        ) && (
          <Typography color="success">
            <b>This token is used for native token</b>{' '}
            <i>(when native token is insufficient)</i>
          </Typography>
        )}
        {/* <pre>{JSON.stringify(currency, null, 2)}</pre> */}

        {Boolean(
          !generateAddress.data?.transfer_from &&
            USDT_OPTIONS.includes(currency.name),
        ) && (
          <Button
            fullWidth
            variant="text"
            size="small"
            sx={{
              color: 'blue',
              textDecoration: 'underline',
              textAlign: 'left',
            }}
            onClick={() => {
              setTransferFrom();
            }}
          >
            <span>
              <b>Use this token for a native token</b>{' '}
              <i>(when native token is insufficient)</i>
            </span>
          </Button>
        )}

        <Typography>Address to deposit:</Typography>
        <Paper elevation={0} sx={{ bgcolor: 'secondary.dark', p: 1 }}>
          <CopyData width="100%" data={addressData.address} />
        </Paper>
      </Stack>
    </Box>
  );
}
