import { CoinModel } from '../../types/dextrade';
import {
  BUILT_IN_NETWORKS,
  NetworkNames,
  NetworkTypes,
} from '../constants/dextrade';

export const isNativeCoin = (coin: CoinModel) => {
  if (!coin) {
    return false;
  }
  const networkInfo = BUILT_IN_NETWORKS[coin.networkName];
  if (!networkInfo) {
    return false;
  }
  return networkInfo.nativeCurrency.symbol === coin.ticker;
};

export const isFiatCoin = (coin: CoinModel) => {
  if (!coin) {
    return false;
  }
  return coin.networkType === NetworkTypes.fiat;
};

export const getIsoCoin = (coin: CoinModel) => {
  let iso = '';
  if (isNativeCoin(coin)) {
    iso = `${BUILT_IN_NETWORKS[coin.networkName].iso}`;
    if (coin.networkName === NetworkNames.binance) {
      iso = `BNB_${iso}`; // exception only of bnb network
    }
  } else if (isFiatCoin(coin)) {
    iso = `${coin.ticker}`;
  } else {
    iso = `${coin.ticker}_${BUILT_IN_NETWORKS[coin.networkName].iso}`;
  }
  return iso;
};
