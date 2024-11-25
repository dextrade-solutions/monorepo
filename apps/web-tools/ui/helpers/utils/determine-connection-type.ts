import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';

import { WalletConnectionType } from '../constants/wallets';

export function determineConnectionType(asset: AssetModel) {
  const supported = [];

  if (asset.chainId) {
    supported.push(WalletConnectionType.eip6963);
  } else if (asset.network === NetworkNames.solana) {
    supported.push(WalletConnectionType.solana);
    supported.push(WalletConnectionType.ledgerSol);
  } else if (asset.network === NetworkNames.tron) {
    supported.push(WalletConnectionType.ledgerTron);
  } else if (asset.network === NetworkNames.bitcoin) {
    supported.push(WalletConnectionType.sats);
    supported.push(WalletConnectionType.ledgerBtc);
  }

  return supported;
}
