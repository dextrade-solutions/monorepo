import { broadcastService } from 'dex-services';

import { ConnectionProvider, TxParams } from './interface';
import buildTx from '../../../../app/helpers/tron/build-tx';
import { WalletConnectionType } from '../../constants/wallets';

class TronlinkExtensionProvider implements ConnectionProvider {
  provider;

  type = WalletConnectionType.tronlink;

  name = 'TronLink';

  constructor() {
    this.provider = window.tronLink;
  }

  get isConnected() {
    return Boolean(this.provider?.tronWeb?.defaultAddress?.base58);
  }

  async connect() {
    await this.provider.request({
      method: 'tron_requestAccounts',
      params: {
        websiteIcon: 'https://p2p.dextrade.com/images/desktop-logo.png',
        websiteName: 'https://p2p.dextrade.com',
      },
    });
    return this.provider.tronWeb.defaultAddress.base58;
  }

  disconnect(): Promise<void> {}

  async txSend(params: TxParams) {
    await this.connect();
    const tronweb = this.provider.tronWeb;
    const fromAddress = tronweb.defaultAddress.base58;
    const toAddress = params.recipient;

    // Step1
    const tx = await buildTx(
      fromAddress,
      toAddress,
      params.value,
      params.contractAddress,
      tronweb,
    );
    const signedTx = await tronweb.trx.sign(tx); // Step2
    // const result = await tronweb.trx.sendRawTransaction(signedTx); // Step3
    await broadcastService.broadcastTrx({
      tx: JSON.stringify(signedTx),
      senderAddress: fromAddress,
    });
    return tx.txID;
  }
}

const tronlinkProvider = new TronlinkExtensionProvider();

export default tronlinkProvider;
