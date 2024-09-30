import { formatFundsAmount } from 'dex-helpers';
import { erc20Abi, formatUnits, hexToNumber } from 'viem';
import { useAccount, useBalance, useReadContracts } from 'wagmi';

import { AssetModel } from '../../app/types/p2p-swaps';

function useAccountBalance(chainId: number | null) {
  const { address } = useAccount();
  const result = useBalance({
    chainId,
    address,
  });
  return result.data?.value;
}

function useErc20Balance(chainId: number | null, contract: string | null) {
  if (!contract) {
    throw new Error('useErc20Balance - no contract provided');
  }
  if (!chainId) {
    throw new Error('useErc20Balance - no asset chain id provided');
  }
  const { address } = useAccount();
  const result = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: contract,
        chainId,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        address: contract,
        chainId,
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ],
  });
  if (result.data) {
    const [balance] = result.data;
    return balance as bigint;
  }
  return null;
}

export function getBalanceHook(asset: AssetModel) {
  if (asset.contract) {
    return useErc20Balance;
  } else if (!asset.isFiat) {
    return useAccountBalance;
  }
  return () => null;
}

export function useAssetBalance(asset: AssetModel) {
  const useBalanceHook = getBalanceHook(asset);
  const chainId = asset.chainId ? hexToNumber(asset.chainId) : null;
  const result = useBalanceHook(chainId, asset.contract);
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
