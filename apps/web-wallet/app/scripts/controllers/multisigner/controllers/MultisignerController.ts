import { Buffer } from 'buffer';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { ChainId } from '../../chains-controller/types';
import { defaultControllerData } from '../constants';
import { IMultisignerChainState, IMultisignerConfig, IMultisignTransaction } from '../types';
import {
  IMultisignerController,
  IMultisignerControllerConfig,
  IMultisignerTransactionCreate,
  IMultisignerTransactionWeight,
} from './IMultisignerController';
import { MultisignerCreatorController } from './MultisignerCreatorController';
import { PollingController } from './PollingController';

export abstract class MultisignerController implements IMultisignerController {
  private readonly _name: string;

  public readonly _className: string;

  private readonly _contract: string;

  private readonly _chainId: string;

  private _started = false;

  private readonly _config: IMultisignerControllerConfig;

  private readonly _creator: MultisignerCreatorController;

  private readonly pollings: Map<string, PollingController> = new Map();

  protected constructor(config: IMultisignerControllerConfig) {
    const { provider, creator } = config;
    this._config = config;
    this._contract = provider.contract || '';
    this._chainId = provider.chainId;
    this._className = this.constructor.name;
    this._name = this._contract || this._chainId || this._className;
    this._creator = creator;
    this.update();
  }

  // COMMON
  public get name() {
    return this._name;
  }

  public get provider(): IMultisignerControllerConfig['provider'] {
    return this._config.provider;
  }

  private get chain(): ChainId | string {
    const { chainId, contract } = this.provider;
    return contract || chainId || '';
  }

  public get deriveHdKey() {
    return this._config.deriveHdKey;
  }

  protected get config(): IMultisignerConfig {
    return this._config;
  }

  protected get creator() {
    return this._creator;
  }

  public get isTestnet() {
    return this._config.isTestnet;
  }

  protected get rates() {
    return this._config.getRates();
  }

  protected get cdt(): string {
    const d = new Date();
    return `${d.toISOString().split('T')[0]} ${d.toLocaleTimeString()}`;
  }

  // STATE
  protected get state(): IMultisignerChainState {
    const state = this._config.getState();
    return state[this.chain] || ({} as IMultisignerChainState);
  }

  protected get multisigs(): IMultisignerChainState['multisigs'] {
    return this.state.multisigs;
  }

  protected get transactions(): IMultisignerChainState['transactions'] {
    return this.state.transactions;
  }

  protected update(state: Partial<IMultisignerChainState> = {}) {
    const updatedState = {
      ...defaultControllerData,
      ...this.state,
      ...state,
    };
    return this._config.update({ [this._name]: updatedState });
  }

  public get transactionsList(): IMultisignTransaction[] {
    return [...this.transactions].map(([_, tx]) => tx);
  }

  // KEYS
  protected get selectedAddress() {
    return this._config.selectedAddress;
  }

  protected get getWalletMnemonicHash() {
    return this._config.getWalletMnemonicHash;
  }

  protected get walletMnemonicHash() {
    return this.getWalletMnemonicHash();
  }

  protected async getDeriveHdKey(): Promise<HDKey> {
    const hdKey = await this.deriveHdKey();
    if (!hdKey) {
      throw new Error('HdKey not available');
    }
    return hdKey;
  }

  protected async getPrivateKey(): Promise<string> {
    const hdKey = await this.getDeriveHdKey();
    if (!hdKey.privateKey) {
      throw new Error('HdKey privateKey is not available');
    }
    return Buffer.from(hdKey.privateKey).toString('hex');
  }

  protected async getPrivateBufferKey(): Promise<Buffer> {
    const hdKey = await this.getDeriveHdKey();
    if (!hdKey.privateKey) {
      throw new Error('HdKey privateKey is not available');
    }
    return Buffer.from(hdKey.privateKey);
  }

  protected async getPublicKey(): Promise<string> {
    const hdKey = await this.deriveHdKey();
    if (!hdKey.publicKey) {
      throw new Error('HdKey publicKey is not available');
    }
    return Buffer.from(hdKey.publicKey).toString('hex');
  }

  // POLLING
  protected get pollingList(): PollingController[] {
    return [...this.pollings].map(([_, pc]) => pc);
  }

  protected createPolling(
    name: string,
    consumer: () => Promise<unknown> | unknown,
    options: { timeout?: number } = {},
  ) {
    const { timeout } = options;
    if (!consumer) {
      throw new Error('Consumer error');
    }
    if (this.pollings.has(name)) {
      console.log(`[${this._name}] Polling with name: ${name} already exist!`);
      return;
    }
    const polling = new PollingController({ timeout, consumer });
    this.pollings.set(name, polling);
  }

  protected getPolling(name: string): PollingController {
    if (!this.pollings.has(name)) {
      throw new Error(`Polling with name:${name} already exist!`);
    }
    return this.pollings.get(name) as PollingController;
  }

  protected clearPolling() {
    [...this.pollings].forEach(([k, pc]) => {
      pc.stop();
      this.pollings.delete(k);
    });
  }

  protected async startPolling() {
    return Promise.all(this.pollingList.map((pc) => pc.start()));
  }

  protected stopPolling() {
    this.pollingList.forEach((pc) => pc.stop());
  }

  // INIT
  abstract onStart(): Promise<void>;

  abstract onStop(): Promise<void>;

  public async start(): Promise<unknown> {
    await this.onStart();
    this._started = true;
    return this.startPolling();
  }

  public async stop(): Promise<unknown> {
    this._started = false;
    this.stopPolling();
    await this.onStop();
    return null;
  }

  public async destroy(): Promise<void> {
    await this.stop();
    this.clearPolling();
  }

  // METHODS
  abstract generate(): Promise<string>;

  abstract add(multisignId: string): Promise<void>;

  abstract remove(multisignId: string): Promise<void>;

  abstract transactionWeight(
    payloads: IMultisignerTransactionWeight,
  ): Promise<any>;

  abstract transactionCreate(
    payloads: IMultisignerTransactionCreate,
  ): Promise<any>;

  abstract transactionSign(txId: string): Promise<void>;

  abstract transactionDecline(txId: string): Promise<void>;
}
