import { capitalize } from 'lodash';

import { MINUTE } from './time';

/**
 * A type representing any valid value for 'type' for setProviderType and other
 * methods that add or manipulate networks in MetaMask state.
 */
export type NetworkType = (typeof NETWORK_TYPES)[keyof typeof NETWORK_TYPES];

/**
 * A union type of all possible hard-coded chain ids. This type is not
 * exhaustive and cannot be used for typing chainId in areas where the user or
 * dapp may specify any chainId.
 */
export type ChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

/**
 * A type that is a union type of all possible hardcoded currency symbols.
 * This type is non-exhaustive, and cannot be used for areas where the user
 * or dapp may supply their own symbol.
 */
export type CurrencySymbol =
  (typeof CURRENCY_SYMBOLS)[keyof typeof CURRENCY_SYMBOLS];
/**
 * Test networks have special symbols that combine the network name and 'ETH'
 * so that they are distinct from mainnet and other networks that use 'ETH'.
 */
export type TestNetworkCurrencySymbol =
  (typeof TEST_NETWORK_TICKER_MAP)[keyof typeof TEST_NETWORK_TICKER_MAP];

/**
 * An object containing preferences for an RPC definition
 */
type RPCPreferences = {
  /**
   * A URL for the block explorer for the RPC's network
   */
  blockExplorerUrl: `https://${string}`;
  /**
   * A image reflecting the asset symbol for the network
   */
  imageUrl: string;
};

/**
 * An object that describes a network to be used inside of MetaMask
 */
export type RPCDefinition = {
  /**
   * The hex encoded ChainId for the network
   */
  chainId: ChainId;
  /**
   * The nickname for the network
   */
  nickname: string;
  /**
   * The URL for the client to send network requests to
   */
  rpcUrl: `https://${string}`;
  /**
   * The Currency Symbol for the network
   */
  ticker: string;
  /**
   * Additional preferences for the network, such as blockExplorerUrl
   */
  rpcPrefs: RPCPreferences;
};

/**
 * For each chain that we support fiat onramps for, we provide a set of
 * configuration options that help for initializing the connectiong to the
 * onramp providers.
 */
type BuyableChainSettings = {
  /**
   * The native currency for the given chain
   */
  nativeCurrency: CurrencySymbol | TestNetworkCurrencySymbol;
  /**
   * The network name or identifier
   */
  network: string;
};

/**
 * Throughout the extension we set the current provider by referencing its
 * "type", which can be any of the values in the below object. These values
 * represent the built-in networks of MetaMask, including test nets, as well
 * as "rpc" which is the "type" of a custom network added by the user or via
 * wallet_addEthereumChain.
 */
export const NETWORK_TYPES = {
  GOERLI: 'goerli',
  LOCALHOST: 'localhost',
  MAINNET: 'ethereum',
  RPC: 'rpc',
  SEPOLIA: 'sepolia',
  LINEA_TESTNET: 'lineatestnet',

  TON: 'ton',
  BITCOIN: 'bitcoin',
  TRON: 'tron',
  BINANCE: 'binance_smart_chain',
  HUMANODE: 'humanode',
} as const;

/**
 * An object containing shortcut names for any non-builtin network. We need
 * this to be able to differentiate between networks that require custom
 * sections of code for our various features, such as swaps or token lists.
 */
export const NETWORK_NAMES = {
  HOMESTEAD: 'homestead',
};

/**
 * The Network ID for our builtin networks. This is the decimal equivalent of
 * the chain id for the network, but is expresssed as a string. Many moons ago
 * the decision was made on the extension team to expressly use chainId with
 * hex encoding over network id. Consider that when accessing this object. Note
 * for cross product purposes: alignment with mobile on this matter has not
 * been fully achieved, thus it is possible for some dependencies to still
 * ask for or require network id.
 */
export const NETWORK_IDS = {
  MAINNET: '1',
  GOERLI: '5',
  LOCALHOST: '1337',
  SEPOLIA: '11155111',
  LINEA_TESTNET: '59140',
  BSC: '56',
  BSC_TESTNET: '97',
  HUMANODE: '5234',
  HUMANODE_TESTNET: '14853',

  TRON: 'TRON',
  TRON_TESTNET: 'TRON_TESTNET',

  BTC: 'BTC',
  BTC_TESTNET: 'BTC_TESTNET',
} as const;

/**
 * An object containing all of the chain ids for networks both built in and
 * those that we have added custom code to support our feature set.
 */
export const CHAIN_IDS = {
  // L1 chains
  MAINNET: '0x1',
  BTC: 'bitcoin',
  BTC_TESTNET: 'bitcoin_testnet',
  TRON: 'tron',
  TRON_TESTNET: 'tron_testnet',
  BINANCE_CHAIN: 'binancechain',
  TON: 'ton',

  // L2 chains
  GOERLI: '0x5',
  LOCALHOST: '0x539',
  BSC: '0x38',
  BSC_TESTNET: '0x61',
  OPTIMISM: '0xa',
  OPTIMISM_TESTNET: '0x1a4',
  POLYGON: '0x89',
  POLYGON_TESTNET: '0x13881',
  AVALANCHE: '0xa86a',
  AVALANCHE_TESTNET: '0xa869',
  FANTOM: '0xfa',
  FANTOM_TESTNET: '0xfa2',
  CELO: '0xa4ec',
  ARBITRUM: '0xa4b1',
  HARMONY: '0x63564c40',
  PALM: '0x2a15c308d',
  SEPOLIA: '0xaa36a7',
  LINEA_TESTNET: '0xe704',
  AURORA: '0x4e454152',
  HUMANODE: '0x1472',
  HUMANODE_TESTNET: '0x3A05',
  MOONRIVER: '0x505',
  CRONOS: '0x19',
  GNOSIS: '0x64',
  ZKSYNC_ERA: '0x144',
  BASE: '0x2105',
  BASE_TESTNET: '0x14a33',
  MOONBEAM: '0x504',
  MOONBEAM_TESTNET: '0x507',
} as const;

export const TEST_CHAINS = [
  CHAIN_IDS.POLYGON_TESTNET,
  CHAIN_IDS.LINEA_TESTNET,
  CHAIN_IDS.FANTOM_TESTNET,
  CHAIN_IDS.OPTIMISM_TESTNET,
  CHAIN_IDS.AVALANCHE_TESTNET,
  CHAIN_IDS.BTC_TESTNET,
  CHAIN_IDS.BSC_TESTNET,
  CHAIN_IDS.TRON_TESTNET,
  CHAIN_IDS.GOERLI,
  CHAIN_IDS.SEPOLIA,
  CHAIN_IDS.HUMANODE_TESTNET,
  CHAIN_IDS.BASE_TESTNET,
];

export const INFURA_PROVIDER_TYPES = [
  // NETWORK_TYPES.MAINNET,
  // NETWORK_TYPES.GOERLI,
  // NETWORK_TYPES.SEPOLIA,
];

export const CHAIN_TYPE_ALIASES = {
  [CHAIN_IDS.MAINNET]: 'ERC-20',
  [CHAIN_IDS.GOERLI]: 'ERC-20',
  [CHAIN_IDS.BSC]: 'BEP-20',
  [CHAIN_IDS.BSC_TESTNET]: 'BEP-20',
  [CHAIN_IDS.BINANCE_CHAIN]: 'BEP-2',
  [CHAIN_IDS.TRON]: 'TRC-20',
  [CHAIN_IDS.TRON_TESTNET]: 'TRC-20',
  [CHAIN_IDS.BTC]: 'BITCOIN',
  [CHAIN_IDS.BTC_TESTNET]: 'BITCOIN',
} as const;

export const CHAIN_NAME_ALIASES = {
  [CHAIN_IDS.MAINNET]: 'ethereum',
  [CHAIN_IDS.GOERLI]: 'ethereum',
  [CHAIN_IDS.BSC]: 'binance_smart_chain',
  [CHAIN_IDS.BSC_TESTNET]: 'binance_smart_chain',
  [CHAIN_IDS.BINANCE_CHAIN]: 'binance',
  [CHAIN_IDS.TRON]: 'tron',
  [CHAIN_IDS.TRON_TESTNET]: 'tron',
  [CHAIN_IDS.BTC]: 'bitcoin',
  [CHAIN_IDS.BTC_TESTNET]: 'bitcoin',
} as const;

/**
 * The largest possible chain ID we can handle.
 * Explanation: https://gist.github.com/rekmarks/a47bd5f2525936c4b8eee31a16345553
 */
export const MAX_SAFE_CHAIN_ID = 4503599627370476;

export const MAINNET_DISPLAY_NAME = 'Ethereum Mainnet';
export const GOERLI_DISPLAY_NAME = 'Goerli';
export const SEPOLIA_DISPLAY_NAME = 'Sepolia';
export const LINEA_TESTNET_DISPLAY_NAME = 'Linea Goerli test network';
export const LOCALHOST_DISPLAY_NAME = 'Localhost 8545';
export const BSC_DISPLAY_NAME = 'Binance Smart Chain';
export const POLYGON_DISPLAY_NAME = 'Polygon';
export const AVALANCHE_DISPLAY_NAME = 'Avalanche Network C-Chain';
export const ARBITRUM_DISPLAY_NAME = 'Arbitrum One';
export const BNB_DISPLAY_NAME = 'BNB Smart Chain';
export const OPTIMISM_DISPLAY_NAME = 'Optimism';
export const FANTOM_DISPLAY_NAME = 'Fantom Opera';
export const HARMONY_DISPLAY_NAME = 'Harmony Mainnet Shard 0';
export const PALM_DISPLAY_NAME = 'Palm';
export const AURORA_DISPLAY_NAME = 'Aurora Mainnet';
export const CELO_DISPLAY_NAME = 'Celo Mainnet';
export const GNOSIS_DISPLAY_NAME = 'Gnosis';
export const ZK_SYNC_ERA_DISPLAY_NAME = 'zkSync Era Mainnet';
export const BASE_DISPLAY_NAME = 'Base Mainnet';

export const TRON_DISPLAY_NAME = 'Tron Testnet';
export const BTC_DISPLAY_NAME = 'Bitcoin Testnet';

export const infuraProjectId = process.env.INFURA_PROJECT_ID;
export const getRpcUrl = ({
  network,
  excludeProjectId = false,
}: {
  network: NetworkType;
  excludeProjectId?: boolean;
}) =>
  `https://${network}.infura.io/v3/${excludeProjectId ? '' : infuraProjectId}`;

export const MAINNET_RPC_URL = 'https://eth.llamarpc.com';
export const GOERLI_RPC_URL = 'https://rpc.tornadoeth.cash/goerli';
export const SEPOLIA_RPC_URL = getRpcUrl({ network: NETWORK_TYPES.SEPOLIA });
export const LINEA_TESTNET_RPC_URL = 'https://rpc.goerli.linea.build';
export const LOCALHOST_RPC_URL = 'http://localhost:8545';
export const BSC_TESTNET_RPC_URL =
  'https://data-seed-prebsc-1-s2.bnbchain.org:8545';
export const BSC_RPC_URL = 'https://bsc-dataseed1.binance.org';
export const HUMANODE_RPC_URL =
  'https://explorer-rpc-http.mainnet.stages.humanode.io';
export const HUMANODE_TESTNET_RPC_URL =
  'https://explorer-rpc-http.testnet5.stages.humanode.io';

/**
 * An object containing the token symbols for various tokens that are either
 * native currencies or those that have been special cased by the extension
 * for supporting our feature set.
 */
export const CURRENCY_SYMBOLS = {
  HUMANDOE: 'eHMND',
  BITCOIN: 'BTC',
  TRON: 'TRX',
  ARBITRUM: 'ETH',
  AVALANCHE: 'AVAX',
  BNB: 'BNB',
  BUSD: 'BUSD',
  CELO: 'CELO',
  DAI: 'DAI',
  GNOSIS: 'XDAI',
  ETH: 'ETH',
  FANTOM: 'FTM',
  HARMONY: 'ONE',
  PALM: 'PALM',
  MATIC: 'MATIC',
  TEST_ETH: 'TESTETH',
  USDC: 'USDC',
  USDT: 'USDT',
  WETH: 'WETH',
  OPTIMISM: 'ETH',
  CRONOS: 'CRO',
  GLIMMER: 'GLMR',
  MOONRIVER: 'MOVR',
  ONE: 'ONE',
  TON: 'TON',
} as const;

export const ETH_TOKEN_IMAGE_URL =
  'https://markets.nyc3.digitaloceanspaces.com/coin-icons/ethereum@3x.png';
export const TEST_ETH_TOKEN_IMAGE_URL =
  'https://markets.nyc3.digitaloceanspaces.com/coin-icons/ethereum@3x.png';
export const BNB_TOKEN_IMAGE_URL =
  'https://markets.nyc3.digitaloceanspaces.com/coin-icons/binancecoin@3x.png';
export const AETH_TOKEN_IMAGE_URL = './images/coins/arbitrum.svg';
export const MATIC_TOKEN_IMAGE_URL = './images/coins/matic.svg';
export const GNOSIS_TOKEN_IMAGE_URL = './images/coins/gnosis.svg';
export const BASE_TOKEN_IMAGE_URL = './images/coins/base.svg';
export const TON_TOKEN_IMAGE_URL = './images/coins/toncoin.svg';

const typedCapitalize = <K extends string>(k: K): Capitalize<K> =>
  capitalize(k) as Capitalize<typeof k>;

export const TEST_NETWORK_TICKER_MAP: {
  [K in Exclude<
    NetworkType,
    'localhost' | 'mainnet' | 'rpc'
  >]: `${Capitalize<K>}${typeof CURRENCY_SYMBOLS.ETH}`;
} = {
  [NETWORK_TYPES.GOERLI]: `${typedCapitalize(NETWORK_TYPES.GOERLI)}${
    CURRENCY_SYMBOLS.ETH
  }`,
  [NETWORK_TYPES.SEPOLIA]: `${typedCapitalize(NETWORK_TYPES.SEPOLIA)}${
    CURRENCY_SYMBOLS.ETH
  }`,
  [NETWORK_TYPES.LINEA_TESTNET]:
    `Linea${CURRENCY_SYMBOLS.ETH}` as `${Capitalize<
      typeof NETWORK_TYPES.LINEA_TESTNET
    >}${typeof CURRENCY_SYMBOLS.ETH}`,
};

export const NETWORK_TO_NAME_MAP = {
  [NETWORK_TYPES.MAINNET]: MAINNET_DISPLAY_NAME,
  [NETWORK_TYPES.GOERLI]: GOERLI_DISPLAY_NAME,
  [NETWORK_TYPES.SEPOLIA]: SEPOLIA_DISPLAY_NAME,
  [NETWORK_TYPES.LINEA_TESTNET]: LINEA_TESTNET_DISPLAY_NAME,
  [NETWORK_TYPES.LOCALHOST]: LOCALHOST_DISPLAY_NAME,

  [NETWORK_IDS.GOERLI]: GOERLI_DISPLAY_NAME,
  [NETWORK_IDS.SEPOLIA]: SEPOLIA_DISPLAY_NAME,
  [NETWORK_IDS.LINEA_TESTNET]: LINEA_TESTNET_DISPLAY_NAME,
  [NETWORK_IDS.MAINNET]: MAINNET_DISPLAY_NAME,
  [NETWORK_IDS.LOCALHOST]: LOCALHOST_DISPLAY_NAME,

  [CHAIN_IDS.GOERLI]: GOERLI_DISPLAY_NAME,
  [CHAIN_IDS.SEPOLIA]: SEPOLIA_DISPLAY_NAME,
  [CHAIN_IDS.LINEA_TESTNET]: LINEA_TESTNET_DISPLAY_NAME,
  [CHAIN_IDS.MAINNET]: MAINNET_DISPLAY_NAME,
  [CHAIN_IDS.LOCALHOST]: LOCALHOST_DISPLAY_NAME,
  [CHAIN_IDS.TRON]: 'Tron',
  [CHAIN_IDS.TRON_TESTNET]: 'Tron Testnet',
  [CHAIN_IDS.BTC]: 'Bitcoin',
  [CHAIN_IDS.BTC_TESTNET]: 'Bitcoin Testnet',
  [CHAIN_IDS.BINANCE_CHAIN]: 'Beacon Chain',
  [CHAIN_IDS.BSC]: 'Binance Smart Chain',
  [CHAIN_IDS.BSC_TESTNET]: 'Binance Smart Chain Testnet',
  [CHAIN_IDS.HUMANODE]: 'Humanode',
  [CHAIN_IDS.HUMANODE_TESTNET]: 'Humanode Testnet',
  [CHAIN_IDS.TON]: 'Ton',
} as const;

export const CHAIN_ID_TO_TYPE_MAP = {
  [CHAIN_IDS.MAINNET]: NETWORK_TYPES.MAINNET,
  [CHAIN_IDS.GOERLI]: NETWORK_TYPES.GOERLI,
  [CHAIN_IDS.SEPOLIA]: NETWORK_TYPES.SEPOLIA,
  [CHAIN_IDS.LINEA_TESTNET]: NETWORK_TYPES.LINEA_TESTNET,
  [CHAIN_IDS.LOCALHOST]: NETWORK_TYPES.LOCALHOST,
} as const;

export const CHAIN_ID_TO_RPC_URL_MAP = {
  [CHAIN_IDS.GOERLI]: GOERLI_RPC_URL,
  [CHAIN_IDS.SEPOLIA]: SEPOLIA_RPC_URL,
  [CHAIN_IDS.LINEA_TESTNET]: LINEA_TESTNET_RPC_URL,
  [CHAIN_IDS.MAINNET]: MAINNET_RPC_URL,
  [CHAIN_IDS.LOCALHOST]: LOCALHOST_RPC_URL,
  [CHAIN_IDS.BSC]: BSC_RPC_URL,
  [CHAIN_IDS.BSC_TESTNET]: BSC_TESTNET_RPC_URL,
  [CHAIN_IDS.HUMANODE]: HUMANODE_RPC_URL,
  [CHAIN_IDS.HUMANODE_TESTNET]: HUMANODE_TESTNET_RPC_URL,
} as const;

export const CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP = {
  [CHAIN_IDS.MAINNET]: ETH_TOKEN_IMAGE_URL,
  [CHAIN_IDS.BSC]: BNB_TOKEN_IMAGE_URL,
  [CHAIN_IDS.POLYGON]: MATIC_TOKEN_IMAGE_URL,
  [CHAIN_IDS.BASE]: BASE_TOKEN_IMAGE_URL,
  [CHAIN_IDS.GNOSIS]: GNOSIS_TOKEN_IMAGE_URL,
  [CHAIN_IDS.TON]: TON_TOKEN_IMAGE_URL,
} as const;

export const NETWORK_ID_TO_ETHERS_NETWORK_NAME_MAP = {
  [NETWORK_IDS.GOERLI]: NETWORK_TYPES.GOERLI,
  [NETWORK_IDS.SEPOLIA]: NETWORK_TYPES.SEPOLIA,
  [NETWORK_IDS.LINEA_TESTNET]: NETWORK_TYPES.LINEA_TESTNET,
  [NETWORK_IDS.MAINNET]: NETWORK_NAMES.HOMESTEAD,
} as const;

export const CHAIN_ID_TO_NETWORK_ID_MAP = {
  [CHAIN_IDS.MAINNET]: NETWORK_IDS.MAINNET,
  [CHAIN_IDS.GOERLI]: NETWORK_IDS.GOERLI,
  [CHAIN_IDS.SEPOLIA]: NETWORK_IDS.SEPOLIA,
  [CHAIN_IDS.LINEA_TESTNET]: NETWORK_IDS.LINEA_TESTNET,
  [CHAIN_IDS.LOCALHOST]: NETWORK_IDS.LOCALHOST,
} as const;

// P2P compatibility networkName aliases
export const CHAIN_ID_TO_NETWORK_MAP = {
  [CHAIN_IDS.MAINNET]: NETWORK_TYPES.MAINNET,
  [CHAIN_IDS.GOERLI]: NETWORK_TYPES.GOERLI,
  [CHAIN_IDS.SEPOLIA]: NETWORK_TYPES.SEPOLIA,
  [CHAIN_IDS.LINEA_TESTNET]: NETWORK_TYPES.LINEA_TESTNET,
  [CHAIN_IDS.LOCALHOST]: NETWORK_TYPES.LOCALHOST,
  [CHAIN_IDS.BSC]: NETWORK_TYPES.BINANCE,
  [CHAIN_IDS.BSC_TESTNET]: NETWORK_TYPES.BINANCE,
  [CHAIN_IDS.TRON]: NETWORK_TYPES.TRON,
  [CHAIN_IDS.TRON_TESTNET]: NETWORK_TYPES.TRON,
  [CHAIN_IDS.BTC]: NETWORK_TYPES.BITCOIN,
  [CHAIN_IDS.BTC_TESTNET]: NETWORK_TYPES.BITCOIN,
  [CHAIN_IDS.HUMANODE]: NETWORK_TYPES.HUMANODE,
  [CHAIN_IDS.TON]: NETWORK_TYPES.TON,
} as const;

// P2P compatibility uuid aliases
export const CHAIN_ID_TO_UUID = {
  [CHAIN_IDS.MAINNET]: 'ethereum',
  [CHAIN_IDS.GOERLI]: 'ethereum',
  [CHAIN_IDS.SEPOLIA]: 'ethereum',
  [CHAIN_IDS.BSC]: 'binancecoin',
  [CHAIN_IDS.BSC_TESTNET]: 'binancecoin',
  [CHAIN_IDS.TRON]: 'tron',
  [CHAIN_IDS.TRON_TESTNET]: 'tron',
  [CHAIN_IDS.BTC]: 'bitcoin',
  [CHAIN_IDS.BTC_TESTNET]: 'bitcoin',
  [CHAIN_IDS.TON]: 'toncoin',
} as const;

export const NATIVE_CURRENCY_TOKEN_IMAGE_MAP = {
  [CURRENCY_SYMBOLS.ETH]: ETH_TOKEN_IMAGE_URL,
  [CURRENCY_SYMBOLS.TEST_ETH]: TEST_ETH_TOKEN_IMAGE_URL,
  [CURRENCY_SYMBOLS.BNB]: BNB_TOKEN_IMAGE_URL,
  [CURRENCY_SYMBOLS.MATIC]: MATIC_TOKEN_IMAGE_URL,
} as const;

export const INFURA_BLOCKED_KEY = 'countryBlocked';

const defaultEtherscanDomain = 'etherscan.io';
const defaultEtherscanSubdomainPrefix = 'api';
/**
 * Map of all Etherscan supported networks.
 */
export const ETHERSCAN_SUPPORTED_NETWORKS = {
  [CHAIN_IDS.GOERLI]: {
    domain: defaultEtherscanDomain,
    subdomain: `${defaultEtherscanSubdomainPrefix}-${
      CHAIN_ID_TO_TYPE_MAP[CHAIN_IDS.GOERLI]
    }`,
    networkId: CHAIN_ID_TO_NETWORK_ID_MAP[CHAIN_IDS.GOERLI],
  },
  [CHAIN_IDS.MAINNET]: {
    domain: defaultEtherscanDomain,
    subdomain: defaultEtherscanSubdomainPrefix,
    networkId: CHAIN_ID_TO_NETWORK_ID_MAP[CHAIN_IDS.MAINNET],
  },
  [CHAIN_IDS.SEPOLIA]: {
    domain: defaultEtherscanDomain,
    subdomain: `${defaultEtherscanSubdomainPrefix}-${
      CHAIN_ID_TO_TYPE_MAP[CHAIN_IDS.SEPOLIA]
    }`,
    networkId: CHAIN_ID_TO_NETWORK_ID_MAP[CHAIN_IDS.SEPOLIA],
  },
  [CHAIN_IDS.LINEA_TESTNET]: {
    domain: 'linea.build',
    subdomain: 'explorer.goerli',
    networkId: CHAIN_ID_TO_NETWORK_ID_MAP[CHAIN_IDS.LINEA_TESTNET],
  },
  [CHAIN_IDS.BSC]: {
    domain: 'bscscan.com',
    subdomain: defaultEtherscanSubdomainPrefix,
    networkId: parseInt(CHAIN_IDS.BSC, 16).toString(),
  },
  [CHAIN_IDS.BSC_TESTNET]: {
    domain: 'bscscan.com',
    subdomain: `${defaultEtherscanSubdomainPrefix}-testnet`,
    networkId: parseInt(CHAIN_IDS.BSC_TESTNET, 16).toString(),
  },
  [CHAIN_IDS.OPTIMISM]: {
    domain: defaultEtherscanDomain,
    subdomain: `${defaultEtherscanSubdomainPrefix}-optimistic`,
    networkId: parseInt(CHAIN_IDS.OPTIMISM, 16).toString(),
  },
  [CHAIN_IDS.OPTIMISM_TESTNET]: {
    domain: defaultEtherscanDomain,
    subdomain: `${defaultEtherscanSubdomainPrefix}-goerli-optimistic`,
    networkId: parseInt(CHAIN_IDS.OPTIMISM_TESTNET, 16).toString(),
  },
  [CHAIN_IDS.POLYGON]: {
    domain: 'polygonscan.com',
    subdomain: defaultEtherscanSubdomainPrefix,
    networkId: parseInt(CHAIN_IDS.POLYGON, 16).toString(),
  },
  [CHAIN_IDS.POLYGON_TESTNET]: {
    domain: 'polygonscan.com',
    subdomain: `${defaultEtherscanSubdomainPrefix}-mumbai`,
    networkId: parseInt(CHAIN_IDS.POLYGON_TESTNET, 16).toString(),
  },
  [CHAIN_IDS.AVALANCHE]: {
    domain: 'snowtrace.io',
    subdomain: defaultEtherscanSubdomainPrefix,
    networkId: parseInt(CHAIN_IDS.AVALANCHE, 16).toString(),
  },
  [CHAIN_IDS.AVALANCHE_TESTNET]: {
    domain: 'snowtrace.io',
    subdomain: `${defaultEtherscanSubdomainPrefix}-testnet`,
    networkId: parseInt(CHAIN_IDS.AVALANCHE_TESTNET, 16).toString(),
  },
  [CHAIN_IDS.FANTOM]: {
    domain: 'ftmscan.com',
    subdomain: defaultEtherscanSubdomainPrefix,
    networkId: parseInt(CHAIN_IDS.FANTOM, 16).toString(),
  },
  [CHAIN_IDS.FANTOM_TESTNET]: {
    domain: 'ftmscan.com',
    subdomain: `${defaultEtherscanSubdomainPrefix}-testnet`,
    networkId: parseInt(CHAIN_IDS.FANTOM_TESTNET, 16).toString(),
  },
  [CHAIN_IDS.MOONBEAM]: {
    domain: 'moonscan.io',
    subdomain: `${defaultEtherscanSubdomainPrefix}-moonbeam`,
    networkId: parseInt(CHAIN_IDS.MOONBEAM, 16).toString(),
  },
  [CHAIN_IDS.MOONBEAM_TESTNET]: {
    domain: 'moonscan.io',
    subdomain: `${defaultEtherscanSubdomainPrefix}-moonbase`,
    networkId: parseInt(CHAIN_IDS.MOONBEAM_TESTNET, 16).toString(),
  },
  [CHAIN_IDS.MOONRIVER]: {
    domain: 'moonscan.io',
    subdomain: `${defaultEtherscanSubdomainPrefix}-moonriver`,
    networkId: parseInt(CHAIN_IDS.MOONRIVER, 16).toString(),
  },
};

/**
 * Hardforks are points in the chain where logic is changed significantly
 * enough where there is a fork and the new fork becomes the active chain.
 * These constants are presented in chronological order starting with BERLIN
 * because when we first needed to track the hardfork we had launched support
 * for EIP-2718 (where transactions can have types and different shapes) and
 * EIP-2930 (optional access lists), which were included in BERLIN.
 *
 * BERLIN - forked at block number 12,244,000, included typed transactions and
 * optional access lists
 * LONDON - future, upcoming fork that introduces the baseFeePerGas, an amount
 * of the ETH transaction fees that will be burned instead of given to the
 * miner. This change necessitated the third type of transaction envelope to
 * specify maxFeePerGas and maxPriorityFeePerGas moving the fee bidding system
 * to a second price auction model.
 */
export const HARDFORKS = {
  BERLIN: 'berlin',
  LONDON: 'london',
} as const;

export const CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP = {
  [CHAIN_IDS.OPTIMISM]: 1,
  [CHAIN_IDS.OPTIMISM_TESTNET]: 1,
};

/**
 * Ethereum JSON-RPC methods that are known to exist but that we intentionally
 * do not support.
 */
export const UNSUPPORTED_RPC_METHODS = new Set([
  // This is implemented later in our middleware stack – specifically, in
  // eth-json-rpc-middleware – but our UI does not support it.
  'eth_signTransaction' as const,
]);

export const IPFS_DEFAULT_GATEWAY_URL = 'dweb.link';

// The first item in transakCurrencies must be the
// default crypto currency for the network
const BUYABLE_CHAIN_ETHEREUM_NETWORK_NAME = 'ethereum';

export const BUYABLE_CHAINS_MAP: {
  [K in Exclude<
    ChainId,
    | typeof CHAIN_IDS.LOCALHOST
    | typeof CHAIN_IDS.PALM
    | typeof CHAIN_IDS.HARMONY
    | typeof CHAIN_IDS.OPTIMISM_TESTNET
    | typeof CHAIN_IDS.BSC_TESTNET
    | typeof CHAIN_IDS.POLYGON_TESTNET
    | typeof CHAIN_IDS.AVALANCHE_TESTNET
    | typeof CHAIN_IDS.FANTOM_TESTNET
    | typeof CHAIN_IDS.MOONBEAM
    | typeof CHAIN_IDS.MOONBEAM_TESTNET
    | typeof CHAIN_IDS.MOONRIVER
    | typeof CHAIN_IDS.AURORA
    | typeof CHAIN_IDS.LINEA_TESTNET
  >]: BuyableChainSettings;
} = {
  [CHAIN_IDS.MAINNET]: {
    nativeCurrency: CURRENCY_SYMBOLS.ETH,
    network: BUYABLE_CHAIN_ETHEREUM_NETWORK_NAME,
  },
  [CHAIN_IDS.GOERLI]: {
    nativeCurrency: TEST_NETWORK_TICKER_MAP[NETWORK_TYPES.GOERLI],
    network: BUYABLE_CHAIN_ETHEREUM_NETWORK_NAME,
  },
  [CHAIN_IDS.SEPOLIA]: {
    nativeCurrency: TEST_NETWORK_TICKER_MAP[NETWORK_TYPES.SEPOLIA],
    network: BUYABLE_CHAIN_ETHEREUM_NETWORK_NAME,
  },
  [CHAIN_IDS.BSC]: {
    nativeCurrency: CURRENCY_SYMBOLS.BNB,
    network: 'bsc',
  },
  [CHAIN_IDS.POLYGON]: {
    nativeCurrency: CURRENCY_SYMBOLS.MATIC,
    network: 'polygon',
  },
  [CHAIN_IDS.AVALANCHE]: {
    nativeCurrency: CURRENCY_SYMBOLS.AVALANCHE,
    network: 'avaxcchain',
  },
  [CHAIN_IDS.FANTOM]: {
    nativeCurrency: CURRENCY_SYMBOLS.FANTOM,
    network: 'fantom',
  },
  [CHAIN_IDS.CELO]: {
    nativeCurrency: CURRENCY_SYMBOLS.CELO,
    network: 'celo',
  },
  [CHAIN_IDS.OPTIMISM]: {
    nativeCurrency: CURRENCY_SYMBOLS.ETH,
    network: 'optimism',
  },
  [CHAIN_IDS.ARBITRUM]: {
    nativeCurrency: CURRENCY_SYMBOLS.ARBITRUM,
    network: 'arbitrum',
  },
};

export const FEATURED_RPCS: RPCDefinition[] = [
  {
    chainId: CHAIN_IDS.ARBITRUM,
    nickname: ARBITRUM_DISPLAY_NAME,
    rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
    ticker: CURRENCY_SYMBOLS.ARBITRUM,
    rpcPrefs: {
      blockExplorerUrl: 'https://explorer.arbitrum.io',
      imageUrl: AETH_TOKEN_IMAGE_URL,
    },
  },
  {
    chainId: CHAIN_IDS.BSC,
    nickname: BNB_DISPLAY_NAME,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    ticker: CURRENCY_SYMBOLS.BNB,
    rpcPrefs: {
      blockExplorerUrl: 'https://bscscan.com/',
      imageUrl: BNB_TOKEN_IMAGE_URL,
    },
  },
  {
    chainId: CHAIN_IDS.POLYGON,
    nickname: `${POLYGON_DISPLAY_NAME} ${capitalize(NETWORK_TYPES.MAINNET)}`,
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${infuraProjectId}`,
    ticker: CURRENCY_SYMBOLS.MATIC,
    rpcPrefs: {
      blockExplorerUrl: 'https://polygonscan.com/',
      imageUrl: MATIC_TOKEN_IMAGE_URL,
    },
  },
  {
    chainId: CHAIN_IDS.GNOSIS,
    nickname: GNOSIS_DISPLAY_NAME,
    rpcUrl: `https://rpc.gnosischain.com`,
    ticker: CURRENCY_SYMBOLS.GNOSIS,
    rpcPrefs: {
      blockExplorerUrl: 'https://gnosisscan.io',
      imageUrl: GNOSIS_TOKEN_IMAGE_URL,
    },
  },
  {
    chainId: CHAIN_IDS.BASE,
    nickname: BASE_DISPLAY_NAME,
    rpcUrl: `https://mainnet.base.org`,
    ticker: CURRENCY_SYMBOLS.ETH,
    rpcPrefs: {
      blockExplorerUrl: 'https://basescan.org',
      imageUrl: BASE_TOKEN_IMAGE_URL,
    },
  },
];

export const SHOULD_SHOW_LINEA_TESTNET_NETWORK =
  new Date().getTime() > Date.UTC(2023, 2, 28);

export const NETWORK_INFO_BY_TOKEN_TYPE = {
  bip49: {
    network: 'bitcoin',
    chainId: 'bitcoin',
  },
  trc20: {
    network: 'tron',
    chainId: 'tron',
  },
  erc20: {
    network: 'ethereum',
    chainId: '0x1',
  },
  bep20: {
    network: 'binance_smart_chain',
    chainId: '0x38',
  },
};

export const BUILT_IN_NETWORKS = {
  [CHAIN_IDS.MAINNET]: {
    chainId: CHAIN_IDS.MAINNET,
    rpcUrl: CHAIN_ID_TO_RPC_URL_MAP[CHAIN_IDS.MAINNET],
    ticker: CURRENCY_SYMBOLS.ETH,
    blockExplorerUrl: `https://${defaultEtherscanDomain}`,
    network: NETWORK_TYPES.MAINNET,
  },
  [CHAIN_IDS.GOERLI]: {
    chainId: CHAIN_IDS.GOERLI,
    rpcUrl: CHAIN_ID_TO_RPC_URL_MAP[CHAIN_IDS.GOERLI],
    ticker: CURRENCY_SYMBOLS.ETH,
    blockExplorerUrl: `https://${NETWORK_TYPES.GOERLI}.${defaultEtherscanDomain}`,
    network: NETWORK_TYPES.MAINNET,
  },
  [CHAIN_IDS.BSC]: {
    chainId: CHAIN_IDS.BSC,
    rpcUrl: CHAIN_ID_TO_RPC_URL_MAP[CHAIN_IDS.BSC],
    ticker: CURRENCY_SYMBOLS.BNB,
    blockExplorerUrl: 'https://bscscan.com',
    network: NETWORK_TYPES.BINANCE,
    atomicSwapContract: '0x0de4942c02125f1b6af0d49e20b2aea4823c0ace',
    atomicSwapExpiration: BigInt(8 * MINUTE),
  },
  [CHAIN_IDS.BSC_TESTNET]: {
    chainId: CHAIN_IDS.BSC_TESTNET,
    rpcUrl: CHAIN_ID_TO_RPC_URL_MAP[CHAIN_IDS.BSC_TESTNET],
    ticker: CURRENCY_SYMBOLS.BNB,
    blockExplorerUrl: 'https://testnet.bscscan.com',
    network: NETWORK_TYPES.BINANCE,
  },
  [CHAIN_IDS.HUMANODE]: {
    chainId: CHAIN_IDS.HUMANODE,
    rpcUrl: CHAIN_ID_TO_RPC_URL_MAP[CHAIN_IDS.HUMANODE],
    ticker: CURRENCY_SYMBOLS.HUMANDOE,
    blockExplorerUrl: 'https://humanode.subscan.io',
    network: NETWORK_TYPES.HUMANODE,
  },
  [CHAIN_IDS.HUMANODE_TESTNET]: {
    chainId: CHAIN_IDS.HUMANODE_TESTNET,
    ticker: CURRENCY_SYMBOLS.HUMANDOE,
    rpcUrl: CHAIN_ID_TO_RPC_URL_MAP[CHAIN_IDS.HUMANODE_TESTNET],
    blockExplorerUrl: 'https://humanode.subscan.io',
    network: NETWORK_TYPES.HUMANODE,
  },
  [CHAIN_IDS.TRON]: {
    chainId: CHAIN_IDS.TRON,
    ticker: CURRENCY_SYMBOLS.TRON,
    decimals: 6,
    blockExplorerUrl: `https://tronscan.org`,
    network: NETWORK_TYPES.TRON,
  },
  [CHAIN_IDS.TRON_TESTNET]: {
    chainId: CHAIN_IDS.TRON_TESTNET,
    ticker: CURRENCY_SYMBOLS.TRON,
    decimals: 6,
    blockExplorerUrl: `https://shasta.tronscan.org`,
    network: NETWORK_TYPES.TRON,
  },
  [CHAIN_IDS.BTC]: {
    chainId: CHAIN_IDS.BTC,
    ticker: CURRENCY_SYMBOLS.BITCOIN,
    decimals: 8,
    blockExplorerUrl: `https://blockchair.com`,
    network: NETWORK_TYPES.BITCOIN,
  },
  [CHAIN_IDS.BTC_TESTNET]: {
    chainId: CHAIN_IDS.BTC_TESTNET,
    ticker: CURRENCY_SYMBOLS.BITCOIN,
    decimals: 8,
    blockExplorerUrl: `https://blockchair.com`,
    network: NETWORK_TYPES.BITCOIN,
  },
  [CHAIN_IDS.TON]: {
    chainId: CHAIN_IDS.TON,
    ticker: CURRENCY_SYMBOLS.TON,
    decimals: 9,
    blockExplorerUrl: `https://tonviewer.com`,
    network: NETWORK_TYPES.TON,
  },
  [CHAIN_IDS.SEPOLIA]: {
    chainId: CHAIN_IDS.SEPOLIA,
    rpcUrl: CHAIN_ID_TO_RPC_URL_MAP[CHAIN_IDS.SEPOLIA],
    ticker: CURRENCY_SYMBOLS.ETH,
    blockExplorerUrl: `https://sepolia.etherscan.io`,
    network: NETWORK_TYPES.BINANCE,
    atomicSwapContract: '0xcb24df99ac13f4a2636feb16be4863aa130b5569',
    atomicSwapExpiration: BigInt(8 * MINUTE),
  },
} as const;
