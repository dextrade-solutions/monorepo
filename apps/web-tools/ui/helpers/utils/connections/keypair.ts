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
}

const keypairConnection = new KeypairConnection();

export default keypairConnection;
