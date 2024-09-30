import { ICON_NAMES } from '../../ui/components/component-library';
import { CHAIN_IDS } from './network';

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

export const RATE_SOURCES_META = {
  [ExchangerRateSources.bestMatch]: {
    title: 'Best match',
    icon: ICON_NAMES.CALCULATOR,
  },
  [ExchangerRateSources.fixedPrice]: {
    title: 'Fixed price',
    icon: ICON_NAMES.SETTING,
  },
  [ExchangerRateSources.binance]: {
    title: 'Binance',
    icon: ICON_NAMES.COIN,
  },
  [ExchangerRateSources.cryptodao]: {
    title: 'Crypto Dao',
    icon: ICON_NAMES.COIN,
  },
  [ExchangerRateSources.tokenview]: {
    title: 'Token View',
    icon: ICON_NAMES.COIN,
  },
  [ExchangerRateSources.coingecko]: {
    title: 'Coin Gecko',
    icon: ICON_NAMES.COIN,
  },
  [ExchangerRateSources.swapienwallet]: {
    title: 'Sapien Wallet',
    icon: ICON_NAMES.COIN,
  },
  [ExchangerRateSources.cryptocompare]: {
    title: 'Cryptocompare',
    icon: ICON_NAMES.COIN,
  },
  [ExchangerRateSources.coinpaprica]: {
    title: 'Coin Paprica',
    icon: ICON_NAMES.COIN,
  },
  [ExchangerRateSources.coinmarketcup]: {
    title: 'Coinmarketcup',
    icon: ICON_NAMES.COIN,
  },
};

export enum ExchangerStatus {
  active = 1,
  deactivated = 0,
}

export enum NetworkTypes {
  fiat = 'fiat',
  unknown = 'unknown',
}

export enum NetworkNames {
  fiat = 'fiat',
  binance = 'binance_smart_chain',
  humanode = 'humanode',
  tron = 'tron',
  bitcoin = 'bitcoin',
  ethereum = 'ethereum',
  sepolia = 'sepolia',
  unknown = 'unknown',
}

export const NETWORK_NAME_TO_CHAIN_ID = {
  [NetworkNames.ethereum]: CHAIN_IDS.MAINNET,
  [NetworkNames.binance]: CHAIN_IDS.BSC,
  [NetworkNames.tron]: CHAIN_IDS.TRON,
  [NetworkNames.bitcoin]: CHAIN_IDS.BTC,
};

export enum ExchangerType {
  P2PClient = 'P2PClient',
  P2PExchanger = 'P2PExchanger',
  OTC = 'OTC',
  DEX = 'DEX',
}

// export enum ExchangeType {
//   client = 'p2pClient',
//   exchanger = 'p2pExchanger',
//   otcClient = 'otcClient',
// }

export enum ExchangeStatuses {
  confirmed = 'CONFIRMED',
  canceled = 'CANCELED',
  wait = 'WAIT',
  confirmation = 'CONFIRMATION',
  sending = 'SENDING',
  exchanging = 'EXCHANGING',
  success = 'SUCCESS',
  overdue = 'OVERDUE',
  refunded = 'REFUNDED',
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
}

export enum ExchangePairType {
  cryptoCrypto = 1,
  cryptoFiat = 2,
  fiatCrypto = 3,
  fiatFiat = 4,
}

export enum KycStatuses {
  unused = 'UNUSED',
  pending = 'PENDING',
  verified = 'VERIFIED',
  declined = 'DECLINED',
}

export enum SessionStatuses {
  active = 'ACTIVE',
  offline = 'OFFLINE',
}
