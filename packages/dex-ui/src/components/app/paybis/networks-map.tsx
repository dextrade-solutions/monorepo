import { BUILT_IN_NETWORKS, NetworkNames, NetworkTypes } from 'dex-helpers';

interface NetworkMapEntry {
  config: (typeof BUILT_IN_NETWORKS)[NetworkNames];
  networkType: NetworkTypes;
}

export const networkMap: Record<string, NetworkMapEntry> = {
  ethereum: {
    config: BUILT_IN_NETWORKS[NetworkNames.ethereum],
    networkType: NetworkTypes.erc20,
  },
  'binance-smart-chain': {
    config: BUILT_IN_NETWORKS[NetworkNames.binance],
    networkType: NetworkTypes.bep20,
  },
  polygon: {
    config: BUILT_IN_NETWORKS[NetworkNames.polygon],
    networkType: NetworkTypes.polygon,
  },
  bitcoin: {
    config: BUILT_IN_NETWORKS[NetworkNames.bitcoin],
    networkType: NetworkTypes.bip86,
  },
  tron: {
    config: BUILT_IN_NETWORKS[NetworkNames.tron],
    networkType: NetworkTypes.trc20,
  },
  solana: {
    config: BUILT_IN_NETWORKS[NetworkNames.solana],
    networkType: NetworkTypes.solana,
  },
  base: {
    config: BUILT_IN_NETWORKS[NetworkNames.base],
    networkType: NetworkTypes.erc20,
  },
};