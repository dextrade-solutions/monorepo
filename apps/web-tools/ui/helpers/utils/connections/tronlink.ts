import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import { broadcastService } from 'dex-services';

import { ConnectionProvider, TxParams } from './interface';
import buildTx from '../../../../app/helpers/tron/build-tx';
import { tronWeb } from '../../../../app/helpers/tron/tronweb';
import { WalletConnectionType } from '../../constants/wallets';

class TronlinkExtensionProvider implements ConnectionProvider {
  provider: TronLinkAdapter;

  type = WalletConnectionType.tronlink;

  name = 'TronLink';

  constructor() {
    this.provider = new TronLinkAdapter();
  }

  get isConnected() {
    return this.provider.connected;
  }

  async getCurrentAddress() {
    return this.provider.address;
  }

  async connect() {
    await this.provider.connect();
    if (!this.provider.address) {
      throw new Error('Connection error: No address');
    }
    return this.provider.address;
  }

  disconnect(): Promise<void> {
    return this.provider.disconnect();
  }

  async txSend(params: TxParams) {
    const fromAddress = await this.connect();
    const toAddress = params.recipient;

    // Step1
    const tx = await buildTx(
      fromAddress,
      toAddress,
      params.value,
      params.contractAddress,
    );
    // const signedTx = await tronweb.trx.sign(tx); // Step2
    const signedTx = await this.provider.signTransaction(tx);
    // const result = await tronweb.trx.sendRawTransaction(signedTx); // Step3
    await broadcastService.broadcastTrx({
      tx: JSON.stringify(signedTx),
      senderAddress: fromAddress,
    });
    return tx.txID;
  }

  signMessage(message: string) {
    return this.provider.signMessage(message);
  }
}

const tronlinkProvider = new TronlinkExtensionProvider();

export default tronlinkProvider;
