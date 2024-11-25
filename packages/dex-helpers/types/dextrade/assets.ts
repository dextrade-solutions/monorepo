import { NetworkNames } from '../../src/constants/dextrade';

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
