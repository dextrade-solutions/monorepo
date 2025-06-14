import {
  concatSig,
  decrypt,
  getEncryptionPublicKey,
  normalize,
  personalSign,
  signTypedData,
  SignTypedDataVersion,
} from '@metamask/eth-sig-util';
import { assertIsHexString, remove0x } from '@metamask/utils';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import {
  privateToPublic,
  publicToAddress,
  ecsign,
  arrToBufArr,
  bufferToHex,
} from 'ethereumjs-util';
import { keccak256, bytesToHex } from 'viem';
import { HDKey } from 'viem/accounts';

// Options:
const hdPathString = `m/44'/60'/0'/0`;
const type = 'HD Key Tree';

class HdKeyring {
  /* PUBLIC METHODS */
  constructor(opts = {}) {
    this.type = type;
    this._wallets = [];
    this.deserialize(opts);
  }

  generateRandomMnemonic() {
    this._initFromMnemonic(bip39.generateMnemonic(wordlist));
  }

  _uint8ArrayToString(mnemonic) {
    const recoveredIndices = Array.from(
      new Uint16Array(new Uint8Array(mnemonic).buffer),
    );
    return recoveredIndices.map((i) => wordlist[i]).join(' ');
  }

  _stringToUint8Array(mnemonic) {
    const indices = mnemonic.split(' ').map((word) => wordlist.indexOf(word));
    return new Uint8Array(new Uint16Array(indices).buffer);
  }

  _mnemonicToUint8Array(mnemonic) {
    let mnemonicData = mnemonic;
    // when encrypted/decrypted, buffers get cast into js object with a property type set to buffer
    if (mnemonic && mnemonic.type && mnemonic.type === 'Buffer') {
      mnemonicData = mnemonic.data;
    }

    if (
      // this block is for backwards compatibility with vaults that were previously stored as buffers, number arrays or plain text strings
      typeof mnemonicData === 'string' ||
      Buffer.isBuffer(mnemonicData) ||
      Array.isArray(mnemonicData)
    ) {
      let mnemonicAsString = mnemonicData;
      if (Array.isArray(mnemonicData)) {
        mnemonicAsString = Buffer.from(mnemonicData).toString();
      } else if (Buffer.isBuffer(mnemonicData)) {
        mnemonicAsString = mnemonicData.toString();
      }
      return this._stringToUint8Array(mnemonicAsString);
    } else if (
      mnemonicData instanceof Object &&
      !(mnemonicData instanceof Uint8Array)
    ) {
      // when encrypted/decrypted the Uint8Array becomes a js object we need to cast back to a Uint8Array
      return Uint8Array.from(Object.values(mnemonicData));
    }
    return mnemonicData;
  }

  serialize() {
    const mnemonicAsString = this._uint8ArrayToString(this.mnemonic);
    const uint8ArrayMnemonic = new TextEncoder('utf-8').encode(
      mnemonicAsString,
    );

    return Promise.resolve({
      mnemonic: Array.from(uint8ArrayMnemonic),
      numberOfAccounts: this._wallets.length,
      hdPath: this.hdPath,
    });
  }

  deserialize(opts = {}) {
    if (opts.numberOfAccounts && !opts.mnemonic) {
      throw new Error(
        'Eth-Hd-Keyring: Deserialize method cannot be called with an opts value for numberOfAccounts and no menmonic',
      );
    }

    if (this.root) {
      throw new Error(
        'Eth-Hd-Keyring: Secret recovery phrase already provided',
      );
    }
    this.opts = opts;
    this._wallets = [];
    this.mnemonic = null;
    this.root = null;
    this.hdPath = opts.hdPath || hdPathString;

    if (opts.mnemonic) {
      this._initFromMnemonic(opts.mnemonic);
    }

    if (opts.numberOfAccounts) {
      return this.addAccounts(opts.numberOfAccounts);
    }

    return Promise.resolve([]);
  }

  addAccounts(numberOfAccounts = 1) {
    if (!this.root) {
      throw new Error('Eth-Hd-Keyring: No secret recovery phrase provided');
    }

    const oldLen = this._wallets.length;
    const newWallets = [];
    for (let i = oldLen; i < numberOfAccounts + oldLen; i++) {
      const wallet = this.root.deriveChild(i);
      newWallets.push(wallet);
      this._wallets.push(wallet);
    }
    const hexWallets = newWallets.map((w) => {
      return this._addressfromPublicKey(w.publicKey);
    });
    return Promise.resolve(hexWallets);
  }

  getAccounts() {
    return this._wallets.map((w) => this._addressfromPublicKey(w.publicKey));
  }

  /* BASE KEYRING METHODS */

  // returns an address specific to an app
  async getAppKeyAddress(address, origin) {
    if (!origin || typeof origin !== 'string') {
      throw new Error(`'origin' must be a non-empty string`);
    }
    const wallet = this._getWalletForAccount(address, {
      withAppKeyOrigin: origin,
    });
    const appKeyAddress = normalize(
      publicToAddress(wallet.publicKey).toString('hex'),
    );

    return appKeyAddress;
  }

  // exportAccount should return a hex-encoded private key:
  async exportAccount(address, opts = {}) {
    const wallet = this._getWalletForAccount(address, opts);
    return bytesToHex(wallet.privateKey);
  }

  // tx is an instance of the ethereumjs-transaction class.
  async signTransaction(address, tx, opts = {}) {
    const privKey = this._getPrivateKeyFor(address, opts);
    const signedTx = tx.sign(privKey);
    // Newer versions of Ethereumjs-tx are immutable and return a new tx object
    return signedTx === undefined ? tx : signedTx;
  }

  // For eth_sign, we need to sign arbitrary data:
  async signMessage(address, data, opts = {}) {
    assertIsHexString(data);
    const message = remove0x(data);
    const privKey = this._getPrivateKeyFor(address, opts);
    const msgSig = ecsign(Buffer.from(message, 'hex'), privKey);
    const rawMsgSig = concatSig(msgSig.v, msgSig.r, msgSig.s);
    return rawMsgSig;
  }

  // For personal_sign, we need to prefix the message:
  async signPersonalMessage(address, msgHex, opts = {}) {
    const privKey = this._getPrivateKeyFor(address, opts);
    const privateKey = Buffer.from(privKey, 'hex');
    const sig = personalSign({ privateKey, data: msgHex });
    return sig;
  }

  // For eth_decryptMessage:
  async decryptMessage(withAccount, encryptedData) {
    const wallet = this._getWalletForAccount(withAccount);
    const { privateKey: privateKeyAsUint8Array } = wallet;
    const privateKeyAsHex = Buffer.from(privateKeyAsUint8Array).toString('hex');
    const sig = decrypt({ privateKey: privateKeyAsHex, encryptedData });
    return sig;
  }

  // personal_signTypedData, signs data along with the schema
  async signTypedData(
    withAccount,
    typedData,
    opts = { version: SignTypedDataVersion.V1 },
  ) {
    // Treat invalid versions as "V1"
    const version = Object.keys(SignTypedDataVersion).includes(opts.version)
      ? opts.version
      : SignTypedDataVersion.V1;

    const privateKey = this._getPrivateKeyFor(withAccount, opts);
    return signTypedData({ privateKey, data: typedData, version });
  }

  removeAccount(account) {
    const address = normalize(account);
    if (
      !this._wallets
        .map(({ publicKey }) => this._addressfromPublicKey(publicKey))
        .includes(address)
    ) {
      throw new Error(`Address ${address} not found in this keyring`);
    }

    this._wallets = this._wallets.filter(
      ({ publicKey }) => this._addressfromPublicKey(publicKey) !== address,
    );
  }

  // get public key for nacl
  async getEncryptionPublicKey(withAccount, opts = {}) {
    const privKey = this._getPrivateKeyFor(withAccount, opts);
    const publicKey = getEncryptionPublicKey(privKey);
    return publicKey;
  }

  _getPrivateKeyFor(address, opts = {}) {
    if (!address) {
      throw new Error('Must specify address.');
    }
    const wallet = this._getWalletForAccount(address, opts);
    return wallet.privateKey;
  }

  _getWalletForAccount(account, opts = {}) {
    const address = normalize(account);
    let wallet = this._wallets.find(({ publicKey }) => {
      return this._addressfromPublicKey(publicKey) === address;
    });
    if (!wallet) {
      throw new Error('HD Keyring - Unable to find matching address.');
    }

    if (opts.withAppKeyOrigin) {
      const { privateKey } = wallet;
      const appKeyOriginBuffer = Buffer.from(opts.withAppKeyOrigin, 'utf8');
      const appKeyBuffer = Buffer.concat([privateKey, appKeyOriginBuffer]);
      const appKeyPrivateKey = arrToBufArr(keccak256(appKeyBuffer, 256));
      const appKeyPublicKey = privateToPublic(appKeyPrivateKey);
      wallet = { privateKey: appKeyPrivateKey, publicKey: appKeyPublicKey };
    }

    return wallet;
  }

  /* PRIVATE / UTILITY METHODS */

  /**
   * Sets appropriate properties for the keyring based on the given
   * BIP39-compliant mnemonic.
   * @param {string|Array<number>|Buffer} mnemonic - A seed phrase represented
   * as a string, an array of UTF-8 bytes, or a Buffer. Mnemonic input
   * passed as type buffer or array of UTF-8 bytes must be NFKD normalized.
   */
  _initFromMnemonic(mnemonic) {
    if (this.root) {
      throw new Error(
        'Eth-Hd-Keyring: Secret recovery phrase already provided',
      );
    }

    this.mnemonic = this._mnemonicToUint8Array(mnemonic);

    // validate before initializing
    const isValid = bip39.validateMnemonic(mnemonic, wordlist);

    if (!isValid) {
      throw new Error(
        'Eth-Hd-Keyring: Invalid secret recovery phrase provided',
      );
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic, wordlist);
    this.hdWallet = HDKey.fromMasterSeed(seed);
    this.root = this.hdWallet.derive(this.hdPath);
  }

  // small helper function to convert publicKey in Uint8Array form to a publicAddress as a hex
  _addressfromPublicKey(publicKey) {
    return bufferToHex(
      publicToAddress(Buffer.from(publicKey), true),
    ).toLowerCase();
  }
}

HdKeyring.type = type;
export default HdKeyring;
