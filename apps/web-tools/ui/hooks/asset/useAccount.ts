import { remove0x } from '@metamask/utils';
import { useWallet } from '@solana/wallet-adapter-react';
// import { useWalletInfo } from '@web3modal/wagmi/react';
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
import { AssetAccount } from '../../types';

export function useAccount(asset: AssetModel): AssetAccount | null {
  // const { walletInfo: walletWCInfo } = useWalletInfo();
  const walletWC = useWCAccount();
  const walletSOLANA = useWallet();
  if (asset.chainId && walletWC.address) {
    return {
      address: walletWC.address,
      redeemAddress: remove0x(walletWC.address),
      refundAddress: remove0x(walletWC.address),
      icon: walletWC.connector?.icon,
      connectedWallet: walletWC.connector?.name,
    };
  }
  if (asset.network === NetworkNames.solana && walletSOLANA.publicKey) {
    return {
      address: walletSOLANA.publicKey?.toBase58(),
      icon: walletSOLANA.wallet?.adapter.icon,
      connectedWallet: walletSOLANA.wallet?.adapter.name,
    };
  }
  if (isBtcTypeAsset(asset)) {
    const redeemPKH = getRedeemKeypair();
    return {
      address: getKeypairAddress(redeemPKH, btcNetworksConfig[asset.network]),
      redeemAddress: hash160(redeemPKH.publicKey).toString('hex'),
      // refundAddress: null, TODO: define refund
    };
  }
  return null;
}
