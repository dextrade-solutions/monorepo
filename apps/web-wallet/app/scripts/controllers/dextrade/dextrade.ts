import { Buffer } from 'buffer';
import EventEmitter from 'events';
import { sha256 } from 'js-sha256';
import elliptic from 'elliptic';
import {
  BaseController,
  RestrictedControllerMessenger,
} from '@metamask/base-controller';
import { HDKey } from 'ethereum-cryptography/hdkey';
import DextradeServiceApi from '../../services/dextrade-service';
import { PaymentMethod, UserPaymentMethod } from './types';
import { KeyringController } from 'app/overrided-metamask/eth-keyring-controller';
import { Platform } from 'types/global';
import { getPlatform } from '../../lib/util';

type Keyring = {
  hdWallet: HDKey;
};

export type DextradeControllerState = {
  apiKey: string | null;
  publicKey: string | null;
  mnemonicHash: string | null;
  paymentMethods: UserPaymentMethod[];
  showReloginDextrade: boolean;
};

const name = 'DextradeController';

export function getDefaultDextradeState(): DextradeControllerState {
  return {
    apiKey: null,
    publicKey: null,
    mnemonicHash: null,
    paymentMethods: [],
    showReloginDextrade: false,
  };
}

const metadata = {
  apiKey: { persist: false, anonymous: false },
  publicKey: { persist: false, anonymous: false },
  mnemonicHash: { persist: true, anonymous: false },
  paymentMethods: { persist: true, anonymous: false },
  showReloginDextrade: { persist: false, anonymous: false },
};

export type DextradeControllerMessenger = RestrictedControllerMessenger<
  typeof name,
  never,
  never,
  never,
  never
>;

/**
 * Controller that store and manage dextrade client personal data,
 * also refreshes the api key
 */
class DextradeController extends BaseController<
  typeof name,
  DextradeControllerState,
  DextradeControllerMessenger
> {
  public api: DextradeServiceApi;

  getCurrentKeyring: () => Promise<Keyring>;

  public hub: EventEmitter;

  constructor({
    messenger,
    keyringController,
    platform,
    getCurrentKeyring,
    state,
  }: {
    messenger: DextradeControllerMessenger;
    keyringController: KeyringController;
    baseUrl?: string;
    platform: Platform;
    getCurrentKeyring: () => Promise<Keyring>;
    state?: Partial<DextradeControllerState>;
  }) {
    super({
      name,
      metadata,
      messenger,
      state: { ...getDefaultDextradeState(), ...state },
    });
    this.api = new DextradeServiceApi({
      getApiKey: () => this.state.apiKey,
      refreshApiKey: this.on401.bind(this),
      signBody: async (message: string) => {
        const keyring = await getCurrentKeyring();
        return this.signDER(keyring.session, message);
      },
      verifyResponse: this.verify.bind(this),
    });
    this.getCurrentKeyring = getCurrentKeyring;
    this.hub = new EventEmitter();
    this.hub.on('changed:api-key', this.loadUserPaymentMethods.bind(this));
  }

  public get isAuthenticated() {
    return Boolean(this.state.apiKey);
  }

  public async savePaymentMethod(val: PaymentMethod) {
    await this.api.paymentMethodCreateOrUpdate(val);
    await this.loadUserPaymentMethods();
  }

  public async removePaymentMethod(id: string) {
    const { paymentMethods } = this.state;
    await this.api.paymentMethodDelete(id);
    this.update((state) => {
      state.paymentMethods = paymentMethods.filter(
        (i) => i.userPaymentMethodId !== Number(id),
      );
    });
  }

  public async setMnemonicHash(val: string) {
    this.update((state) => {
      state.mnemonicHash = val;
    });
    const response = await this.refreshApiKey();
    this.hub.emit('changed:api-key', response);
  }

  private on401() {
    this.setShowRelogin(true);
  }

  setShowRelogin(value: boolean) {
    this.update((state) => {
      state.showReloginDextrade = value;
    });
  }

  async refreshApiKey() {
    const keyring = await this.getCurrentKeyring();
    const masterPubKey = Buffer.from(keyring.hdWallet.publicKey).toString(
      'hex',
    );

    const sessionPubKey = Buffer.from(keyring.session.publicKey).toString(
      'hex',
    );

    const signature = await this.signDER(keyring.hdWallet, sessionPubKey);

    return this.api
      .login(
        this.state.mnemonicHash,
        masterPubKey,
        signature,
        sessionPubKey,
        getPlatform(),
      )
      .then((response: any) => {
        if (response.apikey) {
          this.update((state) => {
            state.apiKey = response.apikey;
            state.publicKey = response.publicKey;
          });
          this.setShowRelogin(false);
          return response;
        }
        throw new Error('refreshApiKey - Not found token in response');
      });
  }

  private async signDER(hdkey: Keyring, message: string): Promise<string> {
    const hashedMessage = sha256(message);
    const ec = new elliptic.ec('secp256k1');

    const { privateKey } = hdkey;
    if (!privateKey) {
      throw new Error(`Private key not found`);
    }
    const signature = ec.sign(hashedMessage, privateKey);
    const result = signature.toDER('hex');
    return result;
  }

  private async verify(message: string, signature: string): Promise<boolean> {
    const ec = new elliptic.ec('secp256k1');
    const hashedMessage = sha256(message);
    if (!this.state.publicKey) {
      return false;
    }

    const key = ec.keyFromPublic(this.state.publicKey, 'hex');
    return key.verify(hashedMessage, signature);
  }

  request(method: string, url: string, data: any, query: any) {
    return this.api.request(method, url, data, query);
  }

  private async loadUserPaymentMethods() {
    const paymentMethods = await this.api.userPaymentMethodsIndex();
    this.update((state) => {
      state.paymentMethods = paymentMethods || [];
    });
  }
}

export default DextradeController;
