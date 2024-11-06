import {
  ExchangerRateSources,
  NetworkNames,
  NetworkTypes,
  TradeStatus,
} from '../src/constants';

export type Country = {
  id: number;
  iso: string;
  name: string;
};

export type Currency = {
  id: number;
  iso: string;
  name: string;
};

export type ConstructorField = {
  id: number;
  required: boolean;
  // no need to validate if it false
  validate: boolean;
  contentType: {
    description: string;
    value: string;
  };
  fieldType: {
    description: string;
    value: string;
  };
};

export type PaymentMethod = {
  paymentMethodId: string;
  name: string;
  fields: ConstructorField[];
};

export type UserPaymentMethod = {
  userPaymentMethodId?: number;
  data: string;
  country: Country;
  currency: Currency;
  paymentMethod: PaymentMethod;
};

export type AuthParams = {
  mnemonicHash: string;
  publicKey: string;
  masterPublicKey: string;
  signature: string;

  deviceId?: string;
  deviceToken?: string;
};

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
  includedStatuses?: TradeStatus[];
  excludedStatuses?: TradeStatus[];
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
  networkName: NetworkNames;
  networkType: NetworkTypes;
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
  configuredWallet: {
    address: string;
    icon: string;
  } | null;
};

export type AdItem = {
  id: number;
  isAtomicSwap: boolean;
  avatar?: string;
  coinId: number;
  coinFromId: number;
  priceInCoin2: number;
  feeInCoin1: number;
  minimumExchangeAmountCoin1?: number;
  maximumExchangeAmountCoin1?: number;
  priceAdjustment: number;
  minimumExchangeAmountCoin2?: number;
  maximumExchangeAmountCoin2?: number;
  name: string;
  walletAddress: string;
  walletAddressInNetwork2: string;
  rating: {
    positive: number;
    negative: number;
    totalRating: number;
  };
  reserve: {
    id: number;
    coin: CoinModel;
    walletAddress?: string; // secure
    reserveInCoin1: number;
    reserveInCoin2: number;
  }[];
  exchangeCompletionRate: number;
  exchangeCount: number;
  fromCoin: CoinModel;
  toCoin: CoinModel;
  isExchangerActive: boolean;
  currentUserExchanger: boolean;
  userId: number;
  coinPair: CoinPair;
  exchangersPolicy?: string;
  lastActive?: number;
  paymentMethods: UserPaymentMethod[];
  isKycVerified: boolean;
  timeToRefund: number;
  provider?: string;
  officialMerchant: boolean;
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

export type Exchanger = {
  id: string;
  name: string;
  active: boolean;
  exchangerSettings: AdSetting[];
};

export type TradeHistoryRow = {
  id: number;
  exchangeId: string;
  status: TradeStatus;
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
  status: TradeStatus;
  exchangerSettings: AdSetting;
  statusHistory: TradeHistoryRow[];
  cdt: number;
  clientParams: string;
  exchangerParams: string;
  unread: number;
  clientSafe?: TradeSafe;
  exchangerSafe?: TradeSafe;
  exchangerSentAmount?: number;
};
