import {
  mainnet as mainnetConfig,
  bsc as bscConfig,
  arbitrum as arbitrumConfig,
  polygon as polygonConfig,
  gnosis as gnosisConfig,
  base as baseConfig,
  xdc as xdcConfig,
} from 'viem/chains';

import { MINUTE } from '../time';

export enum NetworkTypes {
  fiat = 'FIAT',
  bep20 = 'BEP20',
  erc20 = 'ERC20',
  bip49 = 'BIP49',
  trc20 = 'TRC20',
  solana = 'SOLANA',
}

export enum NetworkNames {
  fiat = 'fiat',

  // mainnets
  binanceBep2 = 'binance',
  binance = 'binance_smart_chain',
  humanode = 'humanode',
  tron = 'tron',
  ton = 'the_open_network',
  bitcoin = 'bitcoin',
  ethereum = 'ethereum',
  arbitrum = 'arbitrum',
  avalance = 'avalance',
  gnosis = 'gnosis',
  base = 'base',
  polygon = 'polygon',
  litecoin = 'litecoin',
  solana = 'solana',
  xdc = 'xdc_network',

  // testnets
  sepolia = 'sepolia',
}

export const BUILT_IN_NETWORKS = {
  // EVM
  [NetworkNames.ethereum]: {
    ...mainnetConfig,
    uid: 'ethereum',
  },
  [NetworkNames.binance]: {
    ...bscConfig,
    uid: 'binancecoin',
    atomicSwapContract: '0xac98e7242f8aa005f44accd6baeed1ff5af6824e',
    atomicSwapExpiration: BigInt(2 * MINUTE),
  },
  [NetworkNames.arbitrum]: {
    ...arbitrumConfig,
    uid: 'aeneas',
  },
  [NetworkNames.polygon]: {
    ...polygonConfig,
    uid: 'matic',
  },
  [NetworkNames.gnosis]: {
    ...gnosisConfig,
    uid: 'gnosis',
  },
  [NetworkNames.base]: {
    ...baseConfig,
    uid: 'base',
  },
  [NetworkNames.humanode]: {
    id: 5234,
    uid: 'humanode',
    name: 'Humanode',
    nativeCurrency: { name: 'Humanode', symbol: 'eHMND', decimals: 18 },
  },
  [NetworkNames.xdc]: {
    ...xdcConfig,
    uid: 'xdce-crowd-sale',
  },

  // Non-EVM
  [NetworkNames.ton]: {
    id: null,
    uid: 'ton',
    name: 'The Open Network',
    nativeCurrency: { name: 'Ton Coin', symbol: 'TONCOIN', decimals: 9 },
  },
  [NetworkNames.tron]: {
    id: null,
    uid: 'tron',
    name: 'Tron',
    nativeCurrency: { name: 'Tron', symbol: 'TRX', decimals: 6 },
  },
  [NetworkNames.bitcoin]: {
    id: null,
    uid: 'bitcoin',
    name: 'Bitcoin',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
  },
  [NetworkNames.litecoin]: {
    id: null,
    uid: 'litecoin',
    name: 'Litecoin',
    nativeCurrency: { name: 'Litecoin', symbol: 'LTC', decimals: 8 },
    atomicSwapExpiration: 2, // in blocks
  },
  [NetworkNames.solana]: {
    id: null,
    uid: 'solana',
    name: 'Solana',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  },
};

export const NETWORK_INFO_BY_TOKEN_TYPE = {
  [NetworkTypes.erc20]: {
    network: NetworkNames.ethereum,
    info: BUILT_IN_NETWORKS[NetworkNames.ethereum],
  },
  [NetworkTypes.bep20]: {
    network: NetworkNames.binance,
    info: BUILT_IN_NETWORKS[NetworkNames.binance],
  },
  [NetworkTypes.bip49]: {
    network: NetworkNames.bitcoin,
    info: BUILT_IN_NETWORKS[NetworkNames.bitcoin],
  },
  [NetworkTypes.trc20]: {
    network: NetworkNames.tron,
    info: BUILT_IN_NETWORKS[NetworkNames.tron],
  },
  [NetworkTypes.solana]: {
    network: NetworkNames.solana,
    info: BUILT_IN_NETWORKS[NetworkNames.solana],
  },
};
