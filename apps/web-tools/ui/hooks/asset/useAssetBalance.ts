import { NetworkNames, formatFundsAmount } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { formatUnits } from 'viem';

import useBitcoinBalance from '../bitcoin/useBalance';
import useEvmAccountBalance from '../evm/useAccontBalance';
import useErc20Balance from '../evm/useErc20Balance';
import useMultiversxBalance from '../multiversx/useBalance';
import useSolanaBalance from '../solana/useBalance';
import useTronBalance from '../tron/useBalance';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

type BalanceConfig = {
  network?: NetworkNames;
  isEnabled: (asset: AssetModel) => boolean;
};

const balanceConfigs: Record<string, BalanceConfig> = {
  tron: {
    network: NetworkNames.tron,
    isEnabled: (asset) => asset.network === NetworkNames.tron,
  },
  solana: {
    network: NetworkNames.solana,
    isEnabled: (asset) => asset.network === NetworkNames.solana,
  },
  bitcoin: {
    network: NetworkNames.bitcoin,
    isEnabled: (asset) => asset.network === NetworkNames.bitcoin,
  },
  multiversx: {
    network: NetworkNames.multiversx,
    isEnabled: (asset) => asset.network === NetworkNames.multiversx,
  },
  erc20: {
    isEnabled: (asset) => Boolean(asset.contract),
  },
  evm: {
    isEnabled: (asset) => !asset.isFiat && !asset.contract,
  },
};

export function useAssetBalance(asset?: AssetModel, address?: string) {
  const safeAddress = address || '';
  const safeContract = asset?.contract || '';
  const safeChainId = asset?.chainId;

  // Call all hooks unconditionally with proper type handling
  const tronBalance = useTronBalance(
    safeAddress,
    safeContract,
    Boolean(asset && address && balanceConfigs.tron.isEnabled(asset)),
  );
  const solanaBalance = useSolanaBalance(
    safeAddress,
    safeContract,
    Boolean(asset && address && balanceConfigs.solana.isEnabled(asset)),
  );
  const bitcoinBalance = useBitcoinBalance(
    safeAddress,
    Boolean(asset && address && balanceConfigs.bitcoin.isEnabled(asset)),
  );
  const multiversxBalance = useMultiversxBalance(
    safeAddress,
    Boolean(asset && address && balanceConfigs.multiversx.isEnabled(asset)),
  );
  const erc20Balance = useErc20Balance(
    safeAddress as `0x${string}`,
    safeContract as `0x${string}`,
    safeChainId,
    Boolean(asset && address && balanceConfigs.erc20.isEnabled(asset)),
  );
  const evmBalance = useEvmAccountBalance(
    safeAddress as `0x${string}`,
    safeChainId,
    Boolean(asset && address && balanceConfigs.evm.isEnabled(asset)),
  );

  if (!asset || !address) {
    return null;
  }

  const activeConfig = Object.values(balanceConfigs).find(
    (config) => config.isEnabled(asset),
  );
  if (!activeConfig) {
    return null;
  }

  let result: bigint | null | undefined;

  if (asset.network === NetworkNames.tron) {
    result = tronBalance;
  } else if (asset.network === NetworkNames.solana) {
    result = solanaBalance;
  } else if (asset.network === NetworkNames.bitcoin) {
    result = bitcoinBalance;
  } else if (asset.network === NetworkNames.multiversx) {
    result = multiversxBalance;
  } else if (asset.contract) {
    result = erc20Balance;
  } else if (!asset.isFiat) {
    result = evmBalance;
  }

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
