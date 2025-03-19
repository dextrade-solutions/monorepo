import { BUILT_IN_NETWORKS, getIsoCoin, NetworkNames } from 'dex-helpers';
import * as allAssets from 'dex-helpers/assets-dict';
import { AssetModel, CoinModel } from 'dex-helpers/types';

// Create a type-safe asset dictionary
const assetDict: { [key: string]: AssetModel } = allAssets;

export function getAssetByIso(iso: string): AssetModel | undefined {
  debugger;
  return assetDict[iso];
}

export function parseCoin(
  coin: CoinModel,
  priceInUsdt?: number,
): AssetModel | null {
  const iso = getIsoCoin(coin);
  const asset = getAssetByIso(iso);
  if (asset) {
    return {
      ...asset,
      priceInUsdt,
    } as AssetModel; // Type assertion here
  }
  return null;
}

export function getNative(network: NetworkNames): AssetModel {
  let { iso } = BUILT_IN_NETWORKS[network];

  if (network === NetworkNames.binance) {
    iso = 'BNB_BSC'; // Exception rule for bnb
  }
  const item = getAssetByIso(iso);
  if (!item) {
    throw new Error(`getNative - not found token with network ${network}`);
  }
  return item as AssetModel;
}
