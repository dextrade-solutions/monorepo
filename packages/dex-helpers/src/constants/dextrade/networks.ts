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
  xrc20 = 'XRC20',
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
    key: NetworkNames.ethereum,
    uid: 'ethereum',
  },
  [NetworkNames.binance]: {
    ...bscConfig,
    key: NetworkNames.binance,
    uid: 'binancecoin',
    atomicSwapContract: '0x49007eaa009b59d5478e1609e0de54838788e05d',
    atomicSwapExpiration: BigInt(2 * MINUTE),
  },
  [NetworkNames.arbitrum]: {
    ...arbitrumConfig,
    key: NetworkNames.arbitrum,
    uid: 'aeneas',
  },
  [NetworkNames.polygon]: {
    ...polygonConfig,
    key: NetworkNames.polygon,
    uid: 'matic',
  },
  [NetworkNames.gnosis]: {
    ...gnosisConfig,
    key: NetworkNames.gnosis,
    uid: 'gnosis',
  },
  [NetworkNames.base]: {
    ...baseConfig,
    key: NetworkNames.base,
    uid: 'base',
  },
  [NetworkNames.humanode]: {
    id: 5234,
    key: NetworkNames.humanode,
    uid: 'humanode',
    name: 'Humanode',
    nativeCurrency: { name: 'Humanode', symbol: 'eHMND', decimals: 18 },
  },
  [NetworkNames.xdc]: {
    ...xdcConfig,
    key: NetworkNames.xdc,
    uid: 'xdce-crowd-sale',
  },

  // Non-EVM
  [NetworkNames.ton]: {
    id: null,
    key: NetworkNames.ton,
    uid: 'ton',
    name: 'The Open Network',
    nativeCurrency: { name: 'Ton Coin', symbol: 'TONCOIN', decimals: 9 },
  },
  [NetworkNames.tron]: {
    id: null,
    key: NetworkNames.tron,
    uid: 'tron',
    name: 'Tron',
    nativeCurrency: { name: 'Tron', symbol: 'TRX', decimals: 6 },
  },
  [NetworkNames.bitcoin]: {
    id: null,
    key: NetworkNames.bitcoin,
    uid: 'bitcoin',
    name: 'Bitcoin',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
  },
  [NetworkNames.litecoin]: {
    id: null,
    key: NetworkNames.litecoin,
    uid: 'litecoin',
    name: 'Litecoin',
    nativeCurrency: { name: 'Litecoin', symbol: 'LTC', decimals: 8 },
    atomicSwapExpiration: 2, // in blocks
  },
  [NetworkNames.solana]: {
    id: null,
    key: NetworkNames.solana,
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
  [NetworkTypes.xrc20]: {
    network: NetworkNames.xdc,
    info: BUILT_IN_NETWORKS[NetworkNames.xdc],
  },
};

export const getBlockExplorerLink = ({
  network,
  hash,
}: {
  network: NetworkNames;
  hash: string;
}) => {
  return `${BUILT_IN_NETWORKS[network].blockExplorers?.default.url}/tx/${hash}`;
};
