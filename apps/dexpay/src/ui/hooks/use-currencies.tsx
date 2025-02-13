import assetDict from 'dex-helpers/assets-dict';

import { Currency, Wallet } from '../services';
import { useQuery } from './use-query';
import { useAuth } from './use-auth';

export function useCurrencies() {
  const { user } = useAuth();
  const { data: currencies, isLoading: isLoadingCurrencies } = useQuery(
    Currency.index,
  );
  const { data: balancesData, isLoading: isLoadingBalances } = useQuery(
    Wallet.list,
    { projectId: user?.project.id },
  );
  const items = currencies?.list.currentPageResult || [];
  if (isLoadingBalances || isLoadingCurrencies) {
    return { items, isLoading: true };
  }
  return {
    items: items
      .map((i) => ({
        currency: i,
        asset: assetDict[i.name],
        balance: balancesData?.balances?.map((b) => b.currency_id === i.id),
      }))
      .filter((i) => i.asset),
    isLoading: false,
  };
}
