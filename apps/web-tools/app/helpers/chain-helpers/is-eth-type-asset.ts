import { AssetModel } from '../../types/p2p-swaps';

export function isEthTypeAsset(asset: AssetModel) {
  return Boolean(asset.chainId);
}
