import {
  Address,
  Message,
  Transaction,
  TransactionPayload,
} from '@multiversx/sdk-core';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';

import { ConnectionProvider } from './interface';
import { multiversxService } from '../../../../app/services/multiversx';
import { WalletConnectionType } from '../../constants/wallets';

export class MultiverseExtension implements ConnectionProvider {
  provider: ReturnType<typeof ExtensionProvider.getInstance>;

  type = WalletConnectionType.multiversxExtension;

  name = 'MultiversX Wallet';

  constructor() {
    this.provider = ExtensionProvider.getInstance();
  }

  get isConnected() {
    return this.provider.isConnected();
  }

  async connect() {
    await this.provider.init();
    const result = await this.provider.login();
    return result.address;
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

  async txSend({
    sender: address,
    recipient,
    value,
  }: {
    sender: string;
    recipient: string;
    value: bigint;
  }) {
    await this.provider.init();
    if (!this.isConnected) {
      await this.connect();
    }
    const sender = new Address(address);
    const account = await multiversxService.getAccount(sender);

    const transaction = new Transaction({
      nonce: account.nonce,
      value,
      sender,
      receiver: new Address(recipient),
      gasLimit: 50000, // 50000 is min gas limit
      data: new TransactionPayload(),
      chainID: '1', // 1 is mainnet
    });

    const tx = await this.provider.signTransaction(transaction);

    return multiversxService.sendTransaction(tx);
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

  async disconnect() {
    await this.provider.init();
    await this.provider.logout();
  }
}

const multiversxWalletConnection = new MultiverseExtension();

export default multiversxWalletConnection;
