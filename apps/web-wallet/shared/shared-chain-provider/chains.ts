import {
  CHAIN_IDS,
  BUILT_IN_NETWORKS,
  TEST_CHAINS,
} from '../constants/network';

import { testnetModeInitial } from '../constants/environment';
import ChainBitcoin from './supported/chain-bitcoin';
import ChainEth from './supported/chain-eth';
import ChainTron from './supported/chain-tron';
import ChainTon from './supported/chain-ton';
import { NetworkConfiguration } from './types';

export function getBuiltInChains(): NetworkConfiguration[] {
  return (Object.values(BUILT_IN_NETWORKS) as NetworkConfiguration[]).filter(
    ({ chainId }) =>
      testnetModeInitial
        ? TEST_CHAINS.includes(chainId)
        : !TEST_CHAINS.includes(chainId),
  );
}

export function getSharedProvider(config: NetworkConfiguration) {
  let sharedProvider;
  switch (config.chainId) {
    case CHAIN_IDS.TRON:
    case CHAIN_IDS.TRON_TESTNET:
      sharedProvider = new ChainTron(config);
      break;
    case CHAIN_IDS.BTC:
    case CHAIN_IDS.BTC_TESTNET:
      sharedProvider = new ChainBitcoin(config);
      break;
    case CHAIN_IDS.TON:
      sharedProvider = new ChainTon(config);
      break;
    default:
      // L2 chain
      if (config.chainId.startsWith('0x')) {
        sharedProvider = new ChainEth(config);
      }
  }
  if (!sharedProvider) {
    throw new Error(`getSharedProvider - Unknown chain ${config.chainId}`);
  }
  return sharedProvider;
}
