import * as ethChains from 'wagmi/chains';
import { MINUTE } from './time';

export enum ExchangerRateSources {
  bestMatch = 'BEST_MATCH',
  binance = 'BINANCE',
  cryptodao = 'CRYPTO_DAO',
  tokenview = 'TOKEN_VIEW',
  coingecko = 'COIN_GECKO',
  swapienwallet = 'SWAPIEN_WALLET',
  cryptocompare = 'CRYPTO_COMPARE',
  coinpaprica = 'COIN_PAPICA',
  coinmarketcup = 'COIN_MARKET_CUP',
  fixedPrice = 'FIXED_PRICE',
}

export enum ExchangerStatus {
  active = 1,
  deactivated = 0,
}

export enum NetworkTypes {
  fiat = 'fiat',
  bep20 = 'bep20',
  erc20 = 'erc20',
  bip49 = 'bip49',
  trc20 = 'trc20',
}

export enum NetworkNames {
  fiat = 'fiat',

  // mainnets
  binanceBep2 = 'binance',
  binance = 'binance_smart_chain',
  humanode = 'humanode',
  tron = 'tron',
  litecoin = 'litecoin',
  ton = 'the_open_network',
  bitcoin = 'bitcoin',
  ethereum = 'ethereum',
  arbitrum = 'arbitrum',
  avalance = 'avalance',
  gnosis = 'gnosis',
  base = 'base',
  polygon = 'polygon',

  // testnets
  sepolia = 'sepolia',
}

export enum ExchangeP2PStatus {
  waitExchangerVerify = 'WAIT_EXCHANGER_VERIFY',
  new = 'NEW',
  canceled = 'CANCELED',
  clientTransactionVerify = 'CLIENT_TRANSACTION_VERIFY',
  clientTransactionFailed = 'CLIENT_TRANSACTION_FAILED',
  waitExchangerTransfer = 'WAIT_EXCHANGER_TRANSFER',
  exchangerTransactionVerify = 'EXCHANGER_TRANSACTION_VERIFY',
  exchangerTransactionFailed = 'EXCHANGER_TRANSACTION_FAILED',
  verified = 'VERIFIED',
  completed = 'COMPLETED',
  expired = 'EXPIRED',
  dispute = 'DISPUTE',
}

export const EXCHANGE_P2P_ACTIVE_STATUSES = [
  ExchangeP2PStatus.waitExchangerVerify,
  ExchangeP2PStatus.new,
  ExchangeP2PStatus.clientTransactionVerify,
  ExchangeP2PStatus.waitExchangerTransfer,
  ExchangeP2PStatus.exchangerTransactionVerify,
  ExchangeP2PStatus.verified,
  ExchangeP2PStatus.dispute,
];

export enum TradeType {
  cryptoCrypto = 1,
  cryptoFiat = 2,
  fiatCrypto = 3,
  fiatFiat = 4,
  atomicSwap = 5,
}

export const BUILT_IN_NETWORKS = {
  [NetworkNames.ethereum]: {
    ...ethChains.mainnet,
    uid: 'ethereum',
  },
  [NetworkNames.binance]: {
    ...ethChains.bsc,
    uid: 'binancecoin',
    atomicSwapContract: '0xac98e7242f8aa005f44accd6baeed1ff5af6824e',
    atomicSwapExpiration: BigInt(2 * MINUTE),
  },
  [NetworkNames.arbitrum]: {
    ...ethChains.arbitrum,
    uid: 'aeneas',
  },
  [NetworkNames.polygon]: {
    ...ethChains.polygon,
    uid: 'matic',
  },
  [NetworkNames.gnosis]: {
    ...ethChains.gnosis,
    uid: 'gnosis',
  },
  [NetworkNames.base]: {
    ...ethChains.base,
    uid: 'base',
  },
  [NetworkNames.humanode]: {
    id: 5234,
    uid: 'humanode',
    name: 'Humanode',
    nativeCurrency: { name: 'Humanode', symbol: 'eHMND', decimals: 18 },
  },
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
  [NetworkNames.sepolia]: {
    ...ethChains.sepolia,
    uid: 'sepolia',
    atomicSwapContract: '0xcb24df99ac13f4a2636feb16be4863aa130b5569',

    nativeCurrency: { name: 'Binance', symbol: 'BNB', decimals: 18 },
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
};

export enum PaymentContentTypes {
  additionalInfo = 'ADDITIONAL_INFO',
  cardNumber = 'CARD_NUMBER',
  iban = 'IBAN',
  ibanOrCardNumber = 'IBAN_OR_CARD_NUMBER',
  image = 'IMAGE',
  email = 'EMAIL',
  numberOnly = 'NUMBER_ONLY',
  last4digits = 'LAST_4_DIGITS',
  phone = 'PHONE',
  username = 'USERNAME',
  fullName = 'FULL_NAME',
  bankName = 'BANK_NAME',
  accountOpeningDepartment = 'ACCOUNT_OPENING_DEPARTMENT',
  ban = 'BAN',
  imageQr = 'IMAGE_QR',
}

export enum PaymentMethodTypes {
  wireTransfer = 'WIRE_TRANSFER', // swift transfer
  ban = 'BANK_TRANSFER', // bank transfer
}

export enum KycStatuses {
  unused = 'UNUSED',
  pending = 'PENDING',
  verified = 'VERIFIED',
  declined = 'DECLINED',
}
