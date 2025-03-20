import { useAuth } from './use-auth';
import { useQuery } from './use-query';
import { Address } from '../services';

export default function useAddresses({
  currencyId,
}: { currencyId: number } = {}) {
  const {
    user: { project },
  } = useAuth();
  const addressList = useQuery(Address.listByCurrency, [
    {
      projectId: project.id,
    },
    {
      page: 0,
      currency_id: currencyId,
    },
  ]);

  return {
    items: addressList.data?.currentPageResult || [],
    isLoading: addressList.isLoading,
  };
}
