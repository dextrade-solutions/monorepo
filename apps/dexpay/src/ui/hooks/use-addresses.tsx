import { useAuth } from './use-auth';
import { useQuery } from './use-query';
import { Address } from '../services';

export default function useAddresses({
  currencyId,
}: { currencyId?: number } = {}) {
  const {
    user: { project },
    vaults: { hotWallet },
  } = useAuth();

  const addressList = useQuery(
    Address.list,
    [
      {
        vaultId: hotWallet?.id!,
        projectId: project.id,
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
