import elliptic from 'elliptic';
import { sha256 } from 'js-sha256';

import HDKeyring from '../helpers/eth-hd-keyring';

class KeyringController {
  public keyring?: HDKeyring;

  public init(opts: { sessionSeed: string | null }) {
    this.keyring = new HDKeyring({ mnemonic: opts.sessionSeed });

    if (!opts.sessionSeed) {
      this.keyring.generateRandomMnemonic();
    }
  }

  get publicKey() {
    if (!this.keyring) {
      throw new Error('No keyring initialized');
    }
    return Buffer.from(this.keyring.hdWallet.pubKey).toString('hex');
  }

  get privateKey() {
    return Buffer.from(this.keyring.hdWallet?.privateKey).toString('hex');
  }

  public signDER(message: string) {
    if (!this.keyring) {
      throw new Error('keyring not initialized');
    }

    const hashedMessage = sha256(message);
    const ec = new elliptic.ec('secp256k1');
    const {
      hdWallet: { privateKey },
    } = this.keyring;
    const signature = ec.sign(hashedMessage, privateKey);
    const result = signature.toDER('hex');
    return result;
  }
}

export default KeyringController;
