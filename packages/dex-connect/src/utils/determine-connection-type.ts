import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { WalletConnectionType } from '../constants';

export function determineConnectionType(asset: AssetModel) {
  const supported: WalletConnectionType[] = [WalletConnectionType.dextrade];

  if (asset.chainId) {
    supported.push(WalletConnectionType.eip6963);
  } else if (asset.network === NetworkNames.solana) {
    supported.push(WalletConnectionType.solana);
    supported.push(WalletConnectionType.ledgerSol);
  } else if (asset.network === NetworkNames.tron) {
    supported.push(WalletConnectionType.ledgerTron);
    supported.push(WalletConnectionType.tronlink);
  } else if (asset.network === NetworkNames.bitcoin) {
    supported.push(WalletConnectionType.sats);
    supported.push(WalletConnectionType.ledgerBtc);
  } else if (asset.network === NetworkNames.multiversx) {
    supported.push(WalletConnectionType.multiversxExtension);
  }

  return supported;
}
