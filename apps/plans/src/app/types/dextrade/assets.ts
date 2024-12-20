import {
  ExchangerRateSources,
  NetworkNames,
  NetworkTypes,
} from '../../../helpers/constants/dextrade';

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

export type ReservedAsset = {
  id: number;
  coin: CoinModel;
  reserve: number;
};

export type ReservedAssetWithUsdt = {
  priceInUsdt: number;
  balanceInUsdt: number;
} & ReservedAsset;
