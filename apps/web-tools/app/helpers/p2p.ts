import { NetworkNames } from 'dex-helpers';
import assetList from 'dex-helpers/assets-list';
import { AssetModel, CoinModel } from 'dex-helpers/types';

export function parseCoin(
  coin: CoinModel,
  priceInUsdt?: number,
): AssetModel | null {
  const asset = assetList.find(
    (item) =>
      item.network.toLowerCase() === coin.networkName.toLowerCase() &&
      item.symbol === coin.ticker,
  );
  if (asset) {
    return { ...asset, priceInUsdt };
  }
  return null;
}

export function parseCoinByTickerAndNetwork(
  ticker: string,
  networkName: NetworkNames,
) {
  return assetList.find(
    (item) =>
      item.network.toLowerCase() === networkName.toLowerCase() &&
      item.symbol === ticker,
  );
}

export function getNative(network: NetworkNames) {
  const item = assetList.find(
    (item) => item.isNative && item.network === network,
  );
  if (!item) {
    throw new Error(`getNative - not found token with network ${network}`);
  }
  return item as AssetModel;
}
