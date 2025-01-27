import { buildTxTron, tronWeb } from 'dex-helpers';
import { broadcastService } from 'dex-services';
import { parseUnits } from 'viem';

import { ConnectionProvider, TxParams } from './interface';
import { WalletConnectionType } from '../constants';

export default class TronProvider implements ConnectionProvider {
  provider: any;

  type = WalletConnectionType.tronlink;

  constructor(provider: any) {
    this.provider = provider;
  }

  get icon() {
    return this.provider.icon;
  }

  get name() {
    return this.provider.name;
  }

  get isConnected() {
    return this.provider.connected;
  }

  isAuthorized() {
    return this.provider.connected;
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
    const { asset, amount } = params;
    const fromAddress = await this.connect();
    const toAddress = params.recipient;

    const value = parseUnits(String(amount), asset.decimals);
    // Step1
    const tx = await buildTxTron(fromAddress, toAddress, value, asset.contract);
    const signedTx = await this.provider.signTransaction(tx);

    try {
      await broadcastService.broadcastTrx({
        tx: JSON.stringify(signedTx),
        senderAddress: fromAddress,
      });
    } catch (err) {
      await tronWeb.trx.sendRawTransaction(signedTx); // Step3
    }
    return tx.txID;
  }

  signMessage(message: string) {
    return this.provider.signMessage(message);
  }
}
