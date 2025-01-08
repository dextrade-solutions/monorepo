import engine from '../../../../app/engine';
import { WalletConnectionType } from '../../constants/wallets';

class KeypairConnection {
  type = WalletConnectionType.keypair;

  name = 'Keypair Wallet';

  async connect() {
    const pubkey = engine.keyringController.publicKey;
    return pubkey;
  }

  async disconnect() {
    // do nothing
  }

  signMessage() {
    // TODO: implement
  }

  getCurrentAddress() {
    // TODO: implement
    return engine.keyringController.publicKey;
  }
}

const keypairConnection = new KeypairConnection();

export default keypairConnection;
