import { NetworkNames, TradeType } from 'dex-helpers';
import { AdItem, Trade } from 'dex-helpers/types';
import * as allChains from 'viem/chains';

import type { useAssetInput } from '../../ui/hooks/asset/useAssetInput';

const { ...chains } = allChains;

/**
 * Gets the chain object for the given chain id.
 * @param chainId - Chain id of the target EVM chain.
 * @returns Viem's chain object.
 */
export function getChain(chainId: number) {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain;
    }
  }

  throw new Error(`Chain with id ${chainId} not found`);
}

export function getTokenIdLocal(chainId: string, contract: string | null) {
  const id = [chainId];
  if (contract) {
    id.push(contract);
  }
  return id.join(':');
}

export function determineTradeType(trade: Trade) {
  const fromCoin = trade.exchangerSettings.from;
  const toCoin = trade.exchangerSettings.to;

  let exchangePairType = trade.exchangerSettings.isAtomicSwap
    ? TradeType.atomicSwap
    : TradeType.cryptoCrypto;

  if (fromCoin.networkName === NetworkNames.fiat) {
    exchangePairType = TradeType.fiatCrypto;
  }
  if (toCoin.networkName === NetworkNames.fiat) {
    exchangePairType = TradeType.cryptoFiat;
  }
  return exchangePairType;
}

export function determineTradeTypeByAd(ad: AdItem) {
  const { fromCoin } = ad;
  const { toCoin } = ad;

  let exchangePairType = TradeType.cryptoCrypto;
  if (fromCoin.networkName === NetworkNames.fiat) {
    exchangePairType = TradeType.fiatCrypto;
  }
  if (toCoin.networkName === NetworkNames.fiat) {
    exchangePairType = TradeType.cryptoFiat;
  }
  return exchangePairType;
}

export function getSerializedAddressFromInput(
  input: ReturnType<typeof useAssetInput>,
): string {
  const address = input.account?.address || '';
  if (input.asset.network === NetworkNames.xdc && address.startsWith('0x')) {
    return address.replace('0x', 'xdc');
  }
  return address;
}

export function parseAddress(network: NetworkNames, address: string): string {
  if (network === NetworkNames.xdc && address.startsWith('xdc')) {
    return address.replace('xdc', '0x');
  }
  return address;
}

// Helper function for semantic version comparison:
export function compareVersions(v1: string, v2: string): number {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0; // Handle missing parts
    const v2Part = v2Parts[i] || 0;

    if (v1Part < v2Part) {
      return -1;
    }
    if (v1Part > v2Part) {
      return 1;
    }
  }

  return 0; // Versions are equal
}
