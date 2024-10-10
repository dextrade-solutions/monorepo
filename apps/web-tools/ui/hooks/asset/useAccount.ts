import { remove0x } from '@metamask/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletInfo } from '@web3modal/wagmi/react';
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
  const { walletInfo: walletWCInfo } = useWalletInfo();
  const walletWC = useWCAccount();
  const walletSOLANA = useWallet();
  if (asset.chainId && walletWC.address) {
    return {
      address: walletWC.address,
      reedeemAddress: remove0x(walletWC.address),
      refundAddress: remove0x(walletWC.address),
      icon: walletWCInfo?.icon,
    };
  }
  if (asset.network === NetworkNames.solana) {
    return {
      address: walletSOLANA.publicKey?.toBase58(),
      reedeemAddress: null,
      refundAddress: null,
      icon: walletSOLANA.wallet?.adapter.icon,
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
  return null;
}
