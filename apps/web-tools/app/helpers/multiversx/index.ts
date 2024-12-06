import {
  Address,
  Message,
  Transaction,
  TransactionPayload,
} from '@multiversx/sdk-core';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';

import { getWalletIcon } from '../../../ui/helpers/utils/util';

export class MultiverseExtension {
  provider: ReturnType<typeof ExtensionProvider.getInstance>;

  name = 'MultiversX Wallet';

  get icon() {
    return getWalletIcon(this.name);
  }

  constructor() {
    this.provider = ExtensionProvider.getInstance();
  }

  async connect() {
    await this.provider.init();
    return this.provider.login();
  }

  async loginWithToken() {
    await this.provider.init();

    const account = await this.provider.login({ token: '123' });

    const { address } = account;
    const { signature } = account;
    const nativeAuthToken = packNativeAuthToken(
      address,
      nativeAuthInitialPart,
      signature,
    );

    verifyNativeAuthToken(nativeAuthToken);
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
      chainID: 'M',
      version: 1,
    });

    await this.provider.signTransaction(transaction);
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

  async logout() {
    await this.provider.init();
    await this.provider.logout();
  }
}

const multiversxExtensionProvider = new MultiverseExtension();

export default multiversxExtensionProvider;
