import { BUILT_IN_NETWORKS, getIsoCoin, NetworkNames } from 'dex-helpers';
import * as allAssets from 'dex-helpers/assets-dict';
import { AssetModel, CoinModel } from 'dex-helpers/types';
import { createSearchParams } from 'react-router-dom';
import { toBase64 } from 'uint8array-tools';

import { EXCHANGE_VIEW_ROUTE } from '../../ui/helpers/constants/routes';

// Create a type-safe asset dictionary
const assetDict: { [key: string]: AssetModel } = allAssets;

export function getAssetByIso(iso: string): AssetModel | undefined {
  if (iso.toLowerCase() === 'bnb') {
    return assetDict['BNB_BSC'];
  }
  return assetDict[iso];
}

export function parseCoin(
  coin: CoinModel,
  priceInUsdt?: number,
  extra?: any,
): AssetModel | null {
  try {
    const iso = getIsoCoin(coin);
    const asset = getAssetByIso(iso);
    if (asset) {
      return {
        ...asset,
        priceInUsdt,
        ...(extra || {}),
      } as AssetModel; // Type assertion here
    }
  } catch (error) {
    // pass
  }
  return {
    chainId: null,
    contract: null,
    name: coin.tokenName,
    symbol: coin.ticker,
    uid: coin.uuid,
    network: coin.networkName,
    standard: coin.networkType,
  };
}

export function getNative(network: NetworkNames): AssetModel {
  let { iso } = BUILT_IN_NETWORKS[network];

  if (network === NetworkNames.binance) {
    iso = 'BNB_BSC'; // Exception rule for bnb
  }
  if (network === NetworkNames.arbitrum) {
    iso = 'ETH_ARB';
  }
  const item = getAssetByIso(iso);
  if (!item) {
    throw new Error(`getNative - not found token with network ${network}`);
  }
  return item as AssetModel;
}

export function getMaxOutputDecimalPlaces(asset: AssetModel) {
  if (
    asset.symbol.toLowerCase().includes('usd') ||
    asset.network === NetworkNames.fiat
  ) {
    return 2;
  }
  return 6;
}

// Define a type for the expected parameters
export type AdPathnameParams = {
  fromTicker: string;
  toTicker: string;
  fromNetworkName: string;
  toNetworkName: string;
  name: string;
  amount?: string;
};

export function getAdPathname(params: AdPathnameParams) {
  const adBase64Id = toBase64(
    Buffer.from(createSearchParams(params).toString()),
  );
  return EXCHANGE_VIEW_ROUTE.replace(':id', adBase64Id);
}
