import assetDict from 'dex-helpers/assets-dict';

import { Currency, Wallet } from '../services';
import { useAuth } from './use-auth';
import { useQuery } from './use-query';

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
    return { items: [], isLoading: true };
  }
  return {
    items: items
      .map((i) => ({
        currency: i,
        asset: assetDict[i.name],
        balance: balancesData?.balances?.find((b) => b.currency_id === i.id),
      }))
      .filter((i) => i.asset)
      .sort((a, b) => {
        const balanceA = Number(a.balance?.total_balance_usdt) || 0; // Default to 0 if undefined
        const balanceB = Number(b.balance?.total_balance_usdt) || 0; // Default to 0 if undefined
        return balanceB - balanceA; // Sort in descending order of balance
      }),
    isLoading: false,
  };
}
