import assetDict from 'dex-helpers/assets-dict';

import { Address, Currency, Wallet } from '../services';
import { useAuth } from './use-auth';
import { useQuery } from './use-query';

const BTC_LIGHTNING_CURRENCY = {
  // stub
  id: 9999,
  iso: 'BTC_LIGHTNING',
  name: 'BTC_LIGHTNING',
  public_name: 'BTC (SOL)',
  status: 1,
  coin_id: 999,
  is_native_asset: true,
  icon: null,
  createdAt: '2024-10-23T13:02:41.000Z',
  updatedAt: '2025-02-17T10:40:34.000Z',
  deletedAt: null,
  network: {
    id: 9,
    name: 'BTC',
    public_name: 'BTC',
    createdAt: '2024-06-17T19:18:32.000Z',
    updatedAt: '2025-02-17T10:40:34.000Z',
    deletedAt: null,
  },
  is_active: true,
};

export function useCurrencies({
  disableLoadBalances,
}: {
  disableLoadBalances?: boolean;
} = {}) {
  const {
    user,
    vaults: { hotWallet },
  } = useAuth();
  const projectId = user?.project!.id;
  const { data: currencies, isLoading: isLoadingCurrencies } = useQuery(
    Currency.index,
  );
  const { data: balancesData, isLoading: isLoadingBalances } = useQuery(
    Wallet.list,
    { projectId },
    { enabled: !disableLoadBalances },
  );
  const addressList = useQuery(
    Address.list,
    [
      {
        vaultId: hotWallet?.id!,
        projectId,
      },
      { page: 0 },
    ],
    {
      enabled: Boolean(hotWallet?.id),
    },
  );
  const items = [
    ...(currencies?.list.currentPageResult || []),
    // BTC_LIGHTNING_CURRENCY,
  ];
  if (isLoadingBalances || isLoadingCurrencies || addressList.isLoading) {
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
