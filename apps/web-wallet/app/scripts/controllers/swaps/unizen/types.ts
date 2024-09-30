import { Currency, TradeType } from '@uniswap/sdk-core';

export const enum ETradeProtocol {
  SINGLE_TRADE = 'SINGLE_TRADE',
  SPLIT_TRADE = 'SPLIT_TRADE',
  CROSS_CHAIN_STARGATE = 'CROSS_CHAIN_STARGATE',
  CROSS_CHAIN_CELER = 'CROSS_CHAIN_CELER',
}

export const enum EContractVersion {
  V1 = 'V1',
  V2 = 'V2',
  V3 = 'V3',
}

export const enum EBTCTradeType {
  BTC_TO_NATIVE = 'BTC_TO_NATIVE',
  NATIVE_TO_BTC = 'NATIVE_TO_BTC',
}

export interface ICallItem {
  targetExchange: string;
  data: string;
  amount: string;
}

export interface IDexInfo {
  name: string;
  logo: string;
  route: string[];
  percentage: number;
}

export interface ISingleQuoteAPIData {
  fromTokenAmount: string;
  toTokenAmount: string;
  deltaAmount: string;
  tokenFrom?: Currency | undefined;
  tokenTo?: Currency | undefined;
  tradeType: TradeType;
  tradeProtocol?: ETradeProtocol;
  protocol?: IDexInfo[];
  transactionData?: {
    info:
      | {
          amountIn: string;
          amountOutMin: string;
          srcToken: string;
          dstToken: string;
        }
      | {
          amountInMax: string;
          amountOut: string;
          srcToken: string;
          dstToken: string;
        };
    amountInfo?: {
      amount: string;
      actualQuote: string;
    };
    call: ICallItem[];
  };
  nativeValue?: string;
  contractVersion?: EContractVersion;
}
