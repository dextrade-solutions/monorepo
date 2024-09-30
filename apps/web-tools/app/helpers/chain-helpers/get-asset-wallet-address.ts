import { remove0x } from '@metamask/utils';
import { getWalletClient } from '@wagmi/core';

import { AssetModel } from '../../types/p2p-swaps';
import { config } from '../web3-client-configuration';
import { isBtcTypeAsset } from './is-btc-type-asset';
import { getRedeemKeypair } from '../btc-scripts/get-keys-and-redeem-script';
import { btcNetworksConfig } from '../btc-scripts/networks';
import { getKeypairAddress, hash160 } from '../btc-scripts/utils';

export async function getWalletAddress(asset: AssetModel) {
  if (asset.chainId) {
    const walletClient = await getWalletClient(config, {
      chainId: asset.chainId,
    });
    const { address } = walletClient.account;
    return {
      address,
      reedeemAddress: remove0x(address),
      refundAddress: remove0x(address),
    };
  }
  if (isBtcTypeAsset(asset)) {
    const redeemPKH = getRedeemKeypair();
    return {
      address: getKeypairAddress(redeemPKH, btcNetworksConfig[asset.network]),
      reedeemAddress: hash160(redeemPKH.publicKey).toString('hex'),
      refundAddress: null,
    };
  }
  return { address: null };
}
