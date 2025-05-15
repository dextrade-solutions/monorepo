import {
  mainnet as mainnetConfig,
  bsc as bscConfig,
  arbitrum as arbitrumConfig,
  polygon as polygonConfig,
  gnosis as gnosisConfig,
  base as baseConfig,
  xdc as xdcConfig,
  avalanche as avalancheConfig,
} from 'viem/chains';

import { MINUTE } from '../time';

export enum NetworkTypes {
  fiat = 'FIAT',
  bep20 = 'BEP20',
  erc20 = 'ERC20',
  bip44 = 'BIP44',
  bip49 = 'BIP49',
  bip84 = 'BIP84',
  bip86 = 'BIP86',
  trc20 = 'TRC20',
  solana = 'SOLANA',
  xrc20 = 'XRC20',
  polygon = 'POLYGON',
  arbitrum = 'ARBITRUM',
  somnia = 'SOMNIA',
  avalanche = 'AVALANCHE',
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
  arbitrum = 'arbitrumOne',
  avalance = 'avalance',
  gnosis = 'gnosis',
  base = 'base',
  polygon = 'polygon',
  litecoin = 'litecoin',
  solana = 'solana',
  xdc = 'xdc_network',
  multiversx = 'elrond',
  somnia = 'somnia',
  avalanche = 'avalanche',
  // testnets
  sepolia = 'sepolia',
}

export const BUILT_IN_NETWORKS = {
  // EVM
  [NetworkNames.ethereum]: {
    ...mainnetConfig,
    iso: 'ETH', // network iso
    key: NetworkNames.ethereum,
    uid: 'ethereum',
  },
  [NetworkNames.binance]: {
    ...bscConfig,
    iso: 'BSC',
    key: NetworkNames.binance,
    uid: 'binancecoin',
    atomicSwapContract: '0x49007eaa009b59d5478e1609e0de54838788e05d',
    atomicSwapExpiration: BigInt(2 * MINUTE),
  },
  [NetworkNames.arbitrum]: {
    ...arbitrumConfig,
    iso: 'ARB',
    key: NetworkNames.arbitrum,
    uid: 'aeneas',
  },
  [NetworkNames.polygon]: {
    ...polygonConfig,
    iso: 'POLY',
    key: NetworkNames.polygon,
    uid: 'matic',
  },
  [NetworkNames.gnosis]: {
    ...gnosisConfig,
    iso: 'GNOSIS',
    key: NetworkNames.gnosis,
    uid: 'gnosis',
  },
  [NetworkNames.base]: {
    ...baseConfig,
    iso: 'BASE',
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
    iso: 'XDC',
    key: NetworkNames.xdc,
    uid: 'xdce-crowd-sale',
  },

  // Non-EVM
  [NetworkNames.ton]: {
    id: null,
    key: NetworkNames.ton,
    iso: 'TON',
    uid: 'ton',
    name: 'The Open Network',
    nativeCurrency: { name: 'Ton Coin', symbol: 'TONCOIN', decimals: 9 },
  },
  [NetworkNames.tron]: {
    id: null,
    key: NetworkNames.tron,
    iso: 'TRX',
    uid: 'tron',
    name: 'Tron',
    nativeCurrency: { name: 'Tron', symbol: 'TRX', decimals: 6 },
  },
  [NetworkNames.bitcoin]: {
    id: null,
    iso: 'BTC',
    key: NetworkNames.bitcoin,
    uid: 'bitcoin',
    name: 'Bitcoin',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
  },
  [NetworkNames.litecoin]: {
    id: null,
    iso: 'LTC',
    key: NetworkNames.litecoin,
    uid: 'litecoin',
    name: 'Litecoin',
    nativeCurrency: { name: 'Litecoin', symbol: 'LTC', decimals: 8 },
    atomicSwapExpiration: 2, // in blocks
  },
  [NetworkNames.solana]: {
    id: null,
    iso: 'SOL',
    key: NetworkNames.solana,
    uid: 'solana',
    name: 'Solana',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  },
  [NetworkNames.multiversx]: {
    id: null,
    iso: 'EGLD',
    key: NetworkNames.multiversx,
    uid: 'elrond-erd-2',
    name: 'Multiversx',
    nativeCurrency: { name: 'Multiversx', symbol: 'EGLD', decimals: 18 },
  },
  [NetworkNames.somnia]: {
    id: 5234,
    rpcUrls: {
      default: {
        http: ['https://dream-rpc.somnia.network/'],
      },
    },
    iso: 'STT',
    key: NetworkNames.somnia,
    uid: 'somnia',
    name: 'Somnia',
    nativeCurrency: { name: 'Somnia', symbol: 'STT', decimals: 18 },
  },
  [NetworkNames.avalanche]: {
    ...avalancheConfig,
    iso: 'AVAX',
    key: NetworkNames.avalanche,
    uid: 'avalanche',
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
  [NetworkTypes.polygon]: {
    network: NetworkNames.polygon,
    info: BUILT_IN_NETWORKS[NetworkNames.polygon],
  },
  [NetworkTypes.xrc20]: {
    network: NetworkNames.xdc,
    info: BUILT_IN_NETWORKS[NetworkNames.xdc],
  },
  [NetworkTypes.arbitrum]: {
    network: NetworkNames.arbitrum,
    info: BUILT_IN_NETWORKS[NetworkNames.arbitrum],
  },
  [NetworkTypes.somnia]: {
    network: NetworkNames.somnia,
    info: BUILT_IN_NETWORKS[NetworkNames.somnia],
  },
  [NetworkTypes.avalanche]: {
    network: NetworkNames.avalanche,
    info: BUILT_IN_NETWORKS[NetworkNames.avalanche],
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
