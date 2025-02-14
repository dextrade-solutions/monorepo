import { Box, Typography } from '@mui/material';
import { CopyData } from 'dex-ui';

import { useAuth } from '../../hooks/use-auth';
import { useQuery } from '../../hooks/use-query';
import { Address, Vault } from '../../services';
import { ICurrency } from '../../types';

export default function WalletDepositAddress({
  currency,
}: {
  currency: ICurrency;
}) {
  const { user } = useAuth();
  const projectId = user?.project?.id!;

  const vaults = useQuery(Vault.my, [{ projectId }, { page: 0 }]);

  const hotWallet = (vaults.data?.list.currentPageResult || []).find(
    (v) => v.name === 'Hot Wallet',
  );

  const addressList = useQuery(
    Address.list,
    [
      {
        vaultId: hotWallet?.id!,
        projectId,
      },
      {
        page: 0,
        currencyId: currency.id,
      },
    ],
    {
      enabled: Boolean(hotWallet?.id),
    },
  );

  const [addressData] = addressList.data?.currentPageResult || [];

  if (!addressData) {
    return 'Loading...';
  }
  return (
    <Box>
      <Typography>Use this address to deposit</Typography>
      <CopyData data={addressData.address} />
    </Box>
  );
}
