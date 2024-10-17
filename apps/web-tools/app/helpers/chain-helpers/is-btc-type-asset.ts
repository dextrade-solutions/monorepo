import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';

export function isBtcTypeAsset(asset: AssetModel) {
  const btcTypeNetworks = [NetworkNames.litecoin, NetworkNames.bitcoin];
  return btcTypeNetworks.includes(asset.network);
}
