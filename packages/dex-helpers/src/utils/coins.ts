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

export const isFiatCoin = ({ networkName }: { networkName: string }) => {
  return networkName === NetworkNames.fiat;
};

export const getIsoCoin = ({
  networkName,
  ticker,
}: {
  networkName: string;
  ticker: string;
}) => {
  let iso = '';
  if (isNativeCoin({ networkName, ticker })) {
    iso = `${BUILT_IN_NETWORKS[networkName].iso}`;
    if (networkName === NetworkNames.binance) {
      iso = `BNB_${iso}`;
    }
    if (networkName === NetworkNames.arbitrum) {
      iso = `ETH_${iso}`;
    }
  } else if (isFiatCoin({ networkName })) {
    iso = ticker;
  } else {
    if (!BUILT_IN_NETWORKS[networkName]) {
      throw new Error(`Network ${networkName} not found`);
    }
    iso = `${ticker}_${BUILT_IN_NETWORKS[networkName].iso}`;
  }
  return iso;
};
