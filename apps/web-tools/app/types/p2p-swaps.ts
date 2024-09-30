import { PaymentMethod, UserPaymentMethod } from './dextrade';
import {
  ExchangeP2PStatus,
  ExchangerRateSources,
  NetworkNames,
} from '../constants/p2p';

export type ExchangerHistoryRow = {
  id: string;
  error: string;
};

export type AdFilterModel = {
  fromNetworkName?: NetworkNames;
  fromTicker?: string;
  toNetworkName?: NetworkNames;
  toTicker?: string;
  name?: string;
  size: number;
  page: number;
  notSupportedCoins?: string[];
  orderBy?: string;
  sort?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type TradeFilterModel = {
  includedStatuses?: ExchangeP2PStatus[];
  excludedStatuses?: ExchangeP2PStatus[];
  isExchanger: boolean;
  orderBy: string;
  sort: string;
} & AdFilterModel;

export type CoinPair = {
  id: number;
  pair: string;
  nameFrom: string;
  nameTo: string;
  originalPrice: number; // secure
  price: number;
  priceCoin1InUsdt: number;
  priceCoin2InUsdt: number;
  currencyAggregator: typeof ExchangerRateSources;
};

export type CoinModel = {
  id?: number;
  networkId?: number;
  ticker: string;
  tokenName?: string;
  uuid: string;
  networkName: string;
  networkType: string;
};

export type AssetModel = {
  chainId?: number;
  contract?: string;
  decimals?: number;
  name: string;
  symbol: string;
  uid: string;
  network: NetworkNames;
  standard?: string;
  isFiat: boolean;
  isNative: boolean;
  priceInUsdt?: number;
};

export type AssetBalance = {
  amount: bigint;
  value: string;
  formattedValue: string;
  inUsdt: number | null;
};

export type AssetInputValue = {
  amount: number | string;
  loading: boolean;
  recepientAddress: null | string;
};

export type AdItem = {
  id: number;
  isAtomicSwap: boolean;
  avatar?: string;
  coinId: number;
  coinFromId: number;
  priceInCoin2: number;
  feeInCoin1: number;
  reserveInCoin1: number;
  minimumExchangeAmountCoin1?: number;
  maximumExchangeAmountCoin1?: number;
  priceAdjustment: number;
  reserveInCoin2: number;
  minimumExchangeAmountCoin2?: number;
  maximumExchangeAmountCoin2?: number;
  name: string;
  walletAddress: string;
  walletAddressInNetwork2: string;
  rating: number;
  fromCoin: CoinModel;
  toCoin: CoinModel;
  isExchangerActive: boolean;
  currentUserExchanger: boolean;
  userId: number;
  coinPair: CoinPair;
  exchangersPolicy?: string;
  lastActive?: number;
  paymentMethod?: UserPaymentMethod;
  isKycVerified: boolean;
  timeToRefund: number;
};

export type AdSetting = {
  id: number;
  isAtomicSwap: boolean;
  isVerifiedByUser?: boolean; // custom local field
  userId: number;
  active: boolean;
  priceAdjustment: number;
  walletAddress: string;
  walletAddressInNetwork2: string;
  coinPair: CoinPair;
  from: CoinModel; // secure
  to: CoinModel; // secure
  reserve: {
    id: number;
    coin: CoinModel;
    walletAddress?: string; // secure
    reserve: number;
  };
  priceCoin1InCoin2: number;
  statistic: {
    transactionCount: number;
  };
  cdt: number;
  canUpdate: boolean;
  paymentMethod?: PaymentMethod; // secure

  minimumExchangeAmountCoin1?: number;
  minimumExchangeAmountCoin2?: number;
  timeToPay?: number;
  slippage: number;
};

export type Exchanger = {
  id: string;
  name: string;
  active: boolean;
  exchangerSettings: AdSetting[];
};

export type TradeHistoryRow = {
  id: number;
  exchangeId: string;
  status: ExchangeP2PStatus;
  cdt: number;
};

type TradeSafe = {
  address: string;
  amount: number;
  transactionHash: string;
  vout: number;
};

export type Trade = {
  id: string;
  exchangerId: number;
  exchangerName: string;
  exchangerRating: number;
  exchangerWalletAddress: string;
  exchangerWalletAddressInNetwork2: string;
  exchangerTransactionStatus: string;
  exchangerTransactionHash?: string;
  clientId: number;
  transactionFee?: number;
  clientTransactionHash?: string;
  clientWalletAddress: string;
  clientTransactionStatus: string;
  clientPaymentStatus: UserPaymentMethod;
  exchangerPaymentMethod: UserPaymentMethod;
  coinPair: {
    price: number;
    priceCoin1InUsdt: number;
  };
  amount1: number;
  amount2: number;
  exchangerConfirmedAmount: number;
  priceAdjustment: number;
  status: ExchangeP2PStatus;
  exchangerSettings: AdSetting;
  statusHistory: TradeHistoryRow[];
  cdt: number;
  clientParams: string;
  exchangerParams: string;
  unread: number;
  clientSafe?: TradeSafe;
  exchangerSafe?: TradeSafe;
};
