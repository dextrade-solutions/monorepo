import { remove0x } from '@metamask/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { useAccount as useWCAccount } from 'wagmi';

import { getRedeemKeypair } from '../../../app/helpers/btc-scripts/get-keys-and-redeem-script';
import { btcNetworksConfig } from '../../../app/helpers/btc-scripts/networks';
import {
  getKeypairAddress,
  hash160,
} from '../../../app/helpers/btc-scripts/utils';
import { isBtcTypeAsset } from '../../../app/helpers/chain-helpers/is-btc-type-asset';

export function useAccount(asset: AssetModel) {
  const { address } = useWCAccount();
  const { publicKey } = useWallet();
  if (asset.chainId && address) {
    return {
      address,
      reedeemAddress: remove0x(address),
      refundAddress: remove0x(address),
    };
  }
  if (asset.network === NetworkNames.solana) {
    return {
      address: publicKey?.toBase58(),
      reedeemAddress: null,
      refundAddress: null,
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
  return {
    address: null,
  };
}
