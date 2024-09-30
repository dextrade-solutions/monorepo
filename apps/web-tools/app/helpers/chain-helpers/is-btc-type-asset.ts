import { NetworkNames } from 'dex-helpers';

import { AssetModel } from '../../types/p2p-swaps';

export function isBtcTypeAsset(asset: AssetModel) {
  const btcTypeNetworks = [NetworkNames.litecon, NetworkNames.bitcoin];
  return btcTypeNetworks.includes(asset.network);
}
