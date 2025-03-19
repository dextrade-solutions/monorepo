import { BUILT_IN_NETWORKS, getIsoCoin, NetworkNames } from 'dex-helpers';
import assetDict from 'dex-helpers/assets-dict';
import { AssetModel, CoinModel } from 'dex-helpers/types';

export function getAssetByIso(iso) {
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
    };
  }
  return null;
}

export function getNative(network: NetworkNames) {
  let { iso } = BUILT_IN_NETWORKS[network];

  if (network === NetworkNames.binance) {
    iso = 'BNB_BSC'; // Exeception rule for bnb
  }
  const item = getAssetByIso(iso);
  if (!item) {
    throw new Error(`getNative - not found token with network ${network}`);
  }
  return item as AssetModel;
}
