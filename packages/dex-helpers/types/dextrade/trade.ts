import { AdFilterModel, AdSetting } from './ad';
import { UserPaymentMethod } from './payment-methods';
import { TradeStatus } from '../../src/constants/dextrade';

type TradeSafe = {
  address: string;
  amount: number;
  transactionHash: string;
  vout: number;
};

export type TradeHistoryRow = {
  id: number;
  exchangeId: string;
  status: TradeStatus;
  cdt: number;
};

export type TradeFilterModel = {
  includedStatuses?: TradeStatus[];
  excludedStatuses?: TradeStatus[];
  isExchanger: boolean;
  orderBy: string;
  sort: string;
} & AdFilterModel;

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
};
