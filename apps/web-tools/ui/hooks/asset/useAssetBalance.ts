import { NetworkNames, formatFundsAmount } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { formatUnits } from 'viem';

import useBitcoinBalance from '../bitcoin/useBalance';
import useEvmAccountBalance from '../evm/useAccontBalance';
import useErc20Balance from '../evm/useErc20Balance';
import useMultiversxBalance from '../multiversx/useBalance';
import useSolanaBalance from '../solana/useBalance';
import useTronBalance from '../tron/useBalance';

type BalanceHookParams = {
  address: string;
  chainId?: number;
  contract?: string;
};

export function getBalanceHook(
  asset: AssetModel,
): (params: BalanceHookParams) => bigint | null | undefined {
  if (asset.network === NetworkNames.tron) {
    return ({ address, contract }) => useTronBalance(address, contract);
  }
  if (asset.network === NetworkNames.solana) {
    return ({ address, contract }) => useSolanaBalance(address, contract);
  }
  if (asset.network === NetworkNames.bitcoin) {
    return ({ address }) => useBitcoinBalance(address);
  }
  if (asset.network === NetworkNames.multiversx) {
    return ({ address }) => useMultiversxBalance(address);
  }
  if (asset.contract) {
    return ({ address, chainId, contract }) =>
      useErc20Balance(address, contract, chainId);
  } else if (!asset.isFiat) {
    return ({ address, chainId }) => useEvmAccountBalance(address, chainId);
  }
  return () => null;
}

export function useAssetBalance(asset: AssetModel, address?: string) {
  const useBalanceHook = getBalanceHook(asset);

  const chainId = asset.chainId ? asset.chainId : undefined;
  const result = useBalanceHook({ address, chainId, contract: asset.contract });

  if (typeof result === 'bigint') {
    if (!asset.decimals) {
      throw new Error('useAssetBalance - no decimals provided');
    }
    const value = formatUnits(result, asset.decimals);
    return {
      amount: result,
      value,
      formattedValue: formatFundsAmount(value, asset.symbol),
      inUsdt: asset.priceInUsdt ? asset.priceInUsdt * Number(value) : null,
    };
  }
  return null;
}
