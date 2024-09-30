import * as bitcoin from 'bitcoinjs-lib';
import { NetworkNames } from 'dex-helpers';

import { isBtcTypeAsset } from './is-btc-type-asset';
import { AssetModel } from '../../types/p2p-swaps';
import { btcNetworksConfig } from '../btc-scripts/networks';

export function validateAddress(asset: AssetModel, address: string): boolean {
  if (isBtcTypeAsset(asset)) {
    return validateBtcTypeAddress(asset, address);
  }
  if (asset.network === NetworkNames.tron) {
    return validateTronAddress(asset, address);
  }
  return true;
}

function validateBtcTypeAddress(asset: AssetModel, address: string): boolean {
  try {
    bitcoin.payments.p2pkh({
      address,
      network: btcNetworksConfig[asset.network],
    });
    return true;
  } catch (_) {
    return false;
  }
}

function validateEthTypeAddress(asset: AssetModel, address: string) {}

function validateTronAddress(asset: AssetModel, address: string) {
  return true;
}
