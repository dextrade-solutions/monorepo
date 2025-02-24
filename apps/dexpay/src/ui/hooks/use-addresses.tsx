import { useAuth } from './use-auth';
import { useQuery } from './use-query';
import { Address, Vault } from '../services';

export default function useAddresses({
  currencyId,
}: { currencyId?: number } = {}) {
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
        currency_id: currencyId,
      },
    ],
    {
      enabled: Boolean(hotWallet?.id),
    },
  );

  return {
    items: addressList.data?.currentPageResult || [],
    isLoading: !hotWallet || addressList.isLoading,
  };
}
