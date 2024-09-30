import { addHexPrefix } from 'ethereumjs-util';
import * as allChains from 'viem/chains';

import { hashPassword } from './atomic-swaps';
import { TradeType, NetworkNames } from '../constants/p2p';
import { AdItem, CoinModel, Trade } from '../types/p2p-swaps';

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
