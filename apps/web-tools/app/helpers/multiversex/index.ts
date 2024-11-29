import {
  Address,
  Message,
  Transaction,
  TransactionPayload,
} from '@multiversx/sdk-core';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';

export class MultiverseExtension {
  static icon = '';

  static name = 'Multiversx';

  constructor() {
    this.provider = ExtensionProvider.getInstance();
  }

  async connect() {
    await this.provider.init();
    await this.provider.getAccount();
  }

  async signTransaction() {
    await this.provider.init();

    const sender = await this.provider.getAddress();
    const transaction = new Transaction({
      nonce: 42,
      value: '1',
      sender: new Address(sender),
      receiver: new Address(
        'erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa',
      ),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: new TransactionPayload(),
      chainID: CHAIN_ID,
      version: 1,
    });

    await this.provider.signTransaction(transaction);

    alert(JSON.stringify(transaction.toSendable(), null, 4));
  }

  async signTransactions() {
    await this.provider.init();

    const sender = await this.provider.getAddress();
    const firstTransaction = new Transaction({
      nonce: 42,
      value: '1',
      sender: new Address(sender),
      receiver: new Address(
        'erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa',
      ),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: new TransactionPayload(),
      chainID: CHAIN_ID,
      version: 1,
    });

    const secondTransaction = new Transaction({
      nonce: 43,
      value: '100000000',
      sender: new Address(sender),
      receiver: new Address(
        'erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa',
      ),
      gasPrice: 1000000000,
      gasLimit: 50000,
      data: new TransactionPayload('hello world'),
      chainID: CHAIN_ID,
      version: 1,
    });

    await this.provider.signTransactions([firstTransaction, secondTransaction]);
    console.log('First transaction, upon signing:', firstTransaction);
    console.log('Second transaction, upon signing:', secondTransaction);
  }

  async signMessage() {
    await this.provider.init();

    const address = await this.provider.getAddress();

    const message = new Message({
      address: new Address(address),
      data: Buffer.from('hello'),
    });

    const signedMessage = await this.provider.signMessage(message);
    return signedMessage;
  }
}
