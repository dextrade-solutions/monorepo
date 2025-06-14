import { WebViewBridge } from 'dex-helpers';

import { ConnectionProvider, TxParams } from './interface';
import { WalletConnectionType } from '../constants';

export class DextradeProvider implements ConnectionProvider {
  type = WalletConnectionType.dextrade;

  name = 'Dextrade Wallet';

  isAuthorized() {
    return false;
  }

  getCurrentAddress() {
    return null;
  }

  async connect() {
    throw new Error('no implemented');
  }

  async txSend(params: TxParams) {
    return WebViewBridge.sendToNative('sendTx', params);
  }

  async signMessage(message: string) {
    throw new Error('no implemented');
  }

  async disconnect() {
    throw new Error('no implemented');
  }
}

const dextradeProviderConnection = new DextradeProvider();

export default dextradeProviderConnection;
