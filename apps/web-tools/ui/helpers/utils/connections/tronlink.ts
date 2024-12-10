import { ConnectionProvider, TxParams } from './interface';
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
    const tronweb = this.provider.tronWeb;
    const fromAddress = tronweb.defaultAddress.base58;
    const toAddress = params.recepient;
    const tx = await tronweb.transactionBuilder.sendTrx(
      toAddress,
      params.value,
      fromAddress,
    );
    try {
      const signedTx = await tronweb.trx.sign(tx); // Step2
      await tronweb.trx.sendRawTransaction(signedTx); // Step3
    } catch (e) {
      // error handling
    }
  }
}

const tronlinkProvider = new TronlinkExtensionProvider();

export default tronlinkProvider;
