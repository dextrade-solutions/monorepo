import {
  Address,
  Message,
  Transaction,
  TransactionPayload,
  ApiNetworkProvider,
} from '@multiversx/sdk-core';
import { parseUnits } from 'viem';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';

import { ConnectionProvider, TxParams } from './interface';
import { WalletConnectionType } from '../constants';

const BASE_URL = 'https://api.multiversx.com';

export const multiversxService = new ApiNetworkProvider(BASE_URL, {
  clientName: 'multiversx-your-client-name',
});

export class MultiverseExtension implements ConnectionProvider {
  provider: ReturnType<typeof ExtensionProvider.getInstance>;

  type = WalletConnectionType.multiversxExtension;

  name = 'MultiversX Wallet';

  constructor() {
    this.provider = ExtensionProvider.getInstance();
  }

  isAuthorized() {
    return this.provider.isConnected();
  }

  async connect() {
    await this.provider.init();
    const result = await this.provider.login();
    return result.address;
  }

  getCurrentAddress() {
    return this.provider.getAddress();
  }

  async txSend(params: TxParams) {
    await this.provider.init();
    const sender = await this.provider.getAddress();
    const senderInstance = new Address(sender);
    const account = await multiversxService.getAccount(senderInstance);

    const transaction = new Transaction({
      nonce: account.nonce,
      value: parseUnits(String(params.amount), 8),
      sender,
      receiver: new Address(params.recipient),
      gasLimit: 50000, // 50000 is min gas limit
      data: new TransactionPayload(),
      chainID: '1', // 1 is mainnet
    });

    const tx = await this.provider.signTransaction(transaction);

    return multiversxService.sendTransaction(tx);
  }

  async signMessage(message: string) {
    await this.provider.init();

    const address = await this.provider.getAddress();

    const messageInstance = new Message({
      address: new Address(address),
      data: Buffer.from(message),
    });

    const signedMessage = await this.provider.signMessage(messageInstance);
    return Buffer.from(signedMessage.data).toString('hex');
  }

  async disconnect() {
    await this.provider.init();
    await this.provider.logout();
  }
}

const multiversxWalletConnection = new MultiverseExtension();

export default multiversxWalletConnection;
