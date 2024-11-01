import { CoinModel } from './assets';
import { PaymentMethod, UserPaymentMethod } from './payment-methods';
import {
  ExchangerRateSources,
  NetworkNames,
} from '../../src/constants/dextrade';

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
  slippage: number;
  timeToPay?: number;
  provider?: string;
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
  provider?: string;
  transactionFee?: number;
};
