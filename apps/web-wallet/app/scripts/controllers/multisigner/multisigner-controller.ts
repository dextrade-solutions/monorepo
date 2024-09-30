import { isEmpty, isEqual, xorWith } from 'lodash';
import { BaseControllerV1 } from '@metamask/base-controller';
import { HDKey } from 'ethereum-cryptography/hdkey';
import deepEqual from 'fast-deep-equal';
import { RatesDict } from '../../../overrided-metamask/assets-controllers';
import { KeyringController } from '../../../overrided-metamask/eth-keyring-controller';
import { previousValueComparator } from '../../lib/util';
import MultisignerServiceApi from '../../services/multisigner-service';
import ChainsController from '../chains-controller';
import { Asset, ProviderConfig } from '../network/chain-provider';
import PreferencesController from '../preferences';
import {
  CHAINS_PROVIDER,
  defaultCreatorData,
  EProviderChains,
  providerControllerMap,
} from './constants';
import { MultisignerController } from './controllers';
import {
  IMultisignerTransactionCreate,
  IMultisignerTransactionWeight,
} from './controllers/IMultisignerController';
import { MultisignerCreatorController } from './controllers/MultisignerCreatorController';
import {
  IMultisign,
  IMultisignerAddressedState,
  IMultisignerChainState,
  IMultisignerConfig,
  IMultisignerState,
  IMultisignTransaction,
} from './types';

const CREATOR_KEY = 'creator';

type TAddMultisignTransaction = (
  tx: IMultisignTransaction,
  asset: Asset,
) => void;

class Multisigner extends BaseControllerV1<
  IMultisignerConfig,
  IMultisignerState
> {
  override name = 'MultisignerController';

  api: MultisignerServiceApi;

  deriveHdKey: () => Promise<HDKey>;

  private readonly getRates: () => RatesDict;

  private readonly keyringController: KeyringController;

  private readonly preferencesController: PreferencesController;

  private readonly chainsController: ChainsController;

  private readonly getWalletMnemonicHash: () => string;

  private readonly getSelectedAddress: () => string;

  private readonly getTokensWithBalances: () => Asset[];

  private readonly controllers: Map<string, MultisignerController> = new Map();

  public readonly creatorController: MultisignerCreatorController;

  private readonly addMultisignTransaction: TAddMultisignTransaction;

  private pollingInterval: ReturnType<typeof setInterval>;

  constructor({
    getWalletMnemonicHash,
    deriveHdKey,
    config,
    state,
    preferencesController,
    keyringController,
    chainsController,
    getSelectedAddress,
    getTokensWithBalances,
    getRates,
    addMultisignTransaction,
  }: {
    config?: Partial<IMultisignerConfig>;
    state?: Partial<IMultisignerState>;
    deriveHdKey: () => Promise<HDKey>;
    keyringController: KeyringController;
    preferencesController: PreferencesController;
    chainsController: ChainsController;
    getWalletMnemonicHash: () => string;
    getSelectedAddress: () => string;
    getTokensWithBalances: () => Asset[];
    getRates: () => RatesDict;
    addMultisignTransaction: TAddMultisignTransaction;
  }) {
    super(config, state);

    // controllers
    this.keyringController = keyringController;
    this.preferencesController = preferencesController;
    this.chainsController = chainsController;

    // getter func
    this.getWalletMnemonicHash = getWalletMnemonicHash;
    this.getSelectedAddress = getSelectedAddress;
    this.getTokensWithBalances = getTokensWithBalances;
    this.getRates = getRates;
    this.addMultisignTransaction = addMultisignTransaction;

    this.deriveHdKey = deriveHdKey;

    this.api = new MultisignerServiceApi({
      getMnemonicHash: this.getWalletMnemonicHash,
    });

    this.defaultConfig = {
      selectedAddress: getSelectedAddress() || '',
    };

    this.defaultState = {
      multisigner: {},
    };

    this.creatorController = new MultisignerCreatorController({
      getTokensWithBalances: this.getTokensWithBalances.bind(this),
      getControllers: this.getControllers.bind(this),
      getState: () => {
        const multisigner = this.state?.multisigner || {};
        const selectedMultisigner =
          multisigner[this.getSelectedAddress()] || {};
        return selectedMultisigner[CREATOR_KEY] || defaultCreatorData;
      },
      update: this.updater.bind(this),
    });

    this.initialize();

    this.setLoading();
    this.init();

    this.preferencesController.store.subscribe(
      previousValueComparator(async (previous, next) => {
        const { selectedAddress: prevSelectedAddress } = previous;
        const { selectedAddress: nextSelectedAddress } = next;

        if (prevSelectedAddress !== nextSelectedAddress) {
          this.setLoading();
          this.config.selectedAddress = nextSelectedAddress;
          this.destroyControllers();
          const t = setInterval(async () => {
            if (previous.mnemonicHash === getWalletMnemonicHash()) {
              return;
            }
            await this.init();
            clearInterval(t);
          }, 100);
        }
      }, this.preferencesController.store.getState()),
    );

    this.chainsController.store.subscribe(
      previousValueComparator(async (previous, next) => {
        const { activeProviders: prevProviders } = previous;
        const { activeProviders: nestProviders } = next;

        if (!isEmpty(xorWith(prevProviders, nestProviders, isEqual))) {
          this.setLoading();
          await this.init();
        }
      }, this.chainsController.store.getState()),
    );

    // TODO: Use triggerNetworkRequests/stopNetworkRequests
    // this.keyringController.on('unlock', () => this._onUnlock());
    // this.keyringController.on('lock', () => this._onLock());
  }

  // GET STATE BY SELECTED ADDRESS
  private get stater(): IMultisignerAddressedState {
    const state = this.state?.multisigner || {};
    return state[this.getSelectedAddress()] || {};
  }

  // GET CONTROLLERS MAP
  private getControllers() {
    return this.controllers;
  }

  // UPDATE MULTISIGNER STATE FOR SELECTED ADDRESS
  private updater(
    state: Partial<IMultisignerAddressedState> = {},
    force = false,
  ) {
    const address = this.getSelectedAddress();
    if (!address) {
      return;
    }

    const multisignerState = force ? {} : this.state?.multisigner || {};

    this.update({
      multisigner: {
        ...multisignerState,
        [address]: {
          ...this.stater,
          ...state,
        },
      },
    });
  }

  private setLoading(set = true) {
    this.updater({ isLoading: set });
  }

  // BUILD CONTROLLER BY PROVIDER
  private buildControllerByProvider(
    provider: ProviderConfig,
  ): MultisignerController {
    const chainProvider: EProviderChains | null = Object.entries(
      CHAINS_PROVIDER,
    ).reduce((acc, [providerChain, chains]) => {
      if (!chains.includes(provider.chainId)) {
        return acc;
      }
      acc = providerChain;
      return acc;
    }, null as EProviderChains | null);

    if (!chainProvider) {
      throw new Error(`Provider is not supported ${provider.chainId} chain!`);
    }

    const Controller = providerControllerMap.get(chainProvider);
    if (!Controller) {
      throw new Error(`Controller for ${provider.chainId} not found!`);
    }

    return new Controller({
      config: {
        ...this.config,
        provider,
        creator: this.creatorController,
        getState: () => this.stater.state || {},
        update: (nextState: IMultisignerAddressedState['state']) => {
          const prevState = this.stater.state || {};
          const state = { ...prevState, ...nextState };
          this.updater({ state });
        },
        getWalletMnemonicHash: this.getWalletMnemonicHash.bind(this),
        deriveHdKey: this.deriveHdKey.bind(this),
        isTestnet: this.chainsController.isTestnet(provider),
        getRates: this.getRates.bind(this),
      },
    });
  }

  // CREATE MULTISIGNER CONTROLLERS BY ACTIVE PROVIDERS
  private createControllers() {
    // const providers: ProviderConfig[] =
    //   this.chainsController.state.activeProviders || [];
    // TODO: set localId, remove chainId/contract
    const providers = [
      { chainId: 'bitcoin', contract: '', localId: 'bitcoin' },
    ];
    for (const provider of providers) {
      try {
        const controllerInstance = this.buildControllerByProvider(provider);
        this.controllers.set(controllerInstance.name, controllerInstance);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    }
  }

  // GET MULTISIGNER CONTROLLER BY CHAIN
  private getControllerByLocalId(localId: string): MultisignerController {
    const controller = this.controllers.get(localId);
    if (!controller) {
      throw new Error(`Controller for ${localId} is not supported`);
    }
    return controller;
  }

  private destroyControllers() {
    this.stop();
    [...this.controllers].forEach(([_, controller]) => controller.destroy());
    this.controllers.clear();
  }

  private stop() {
    this.pollingTransactionCheckerStop();
    [...this.controllers].forEach(([_, controller]) => controller.stop());
  }

  private async start() {
    this.pollingTransactionCheckerStart();
    this.creatorController.mount();
    if (!this.controllers.size) {
      this.createControllers();
    }
    return Promise.all(
      [...this.controllers].map(([_, controller]) => controller.start()),
    );
  }

  private async init() {
    // TODO: Now its disabled because of CORS error
    return;
    this.pollingTransactionCheckerStop();
    this.destroyControllers();
    this.createControllers();
    try {
      if (this.isUnlocked) {
        await this.start();
      }
    } finally {
      this.setLoading(false);
      this.pollingTransactionCheckerStart();
    }
  }

  private _onLock() {
    this.stop();
  }

  private _onUnlock() {
    this.setLoading();
    this.config.selectedAddress =
      this.preferencesController.store.getState().selectedAddress;
    this.start().finally(() => this.setLoading(false));
  }

  // COMMON
  private get isUnlocked(): boolean {
    return this.keyringController.memStore.getState().isUnlocked;
  }

  public get allMultisigns(): Map<string, IMultisign> {
    return Object.entries(this.stater.state).reduce((acc, [k, v]) => {
      const mss = (v as IMultisignerChainState).multisigs || new Map();
      acc = new Map([...acc].concat([...mss]));
      return acc;
    }, new Map());
  }

  public get allTransactions(): Map<string, IMultisignTransaction> {
    return Object.entries(this.stater.state).reduce((acc, [k, v]) => {
      const mss = (v as IMultisignerChainState).transactions || new Map();
      acc = new Map([...acc].concat([...mss]));
      return acc;
    }, new Map());
  }

  public isUpdated(
    prevState: IMultisignerState,
    nextState: IMultisignerState,
  ): boolean {
    const stateSelected = (
      state: IMultisignerState,
    ): Partial<IMultisignerAddressedState> => {
      return Object.entries(
        state.multisigner[this.getSelectedAddress()].state,
      ).reduce((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, {});
    };
    return deepEqual(stateSelected(prevState), stateSelected(nextState));
  }

  private checkActivityTransactions() {
    const tokens = this.getTokensWithBalances();
    this.controllers.forEach((c) => {
      c.transactionsList.forEach((tx) => {
        const { txHash, errorMessage, addressId } = tx;
        const assetDetails = tokens.find(
          ({ multisig }) => Boolean(multisig) && multisig.id === addressId,
        );
        if (!txHash || Boolean(errorMessage) || !assetDetails) {
          return;
        }

        this.addMultisignTransaction(tx, assetDetails);
      });
    });
  }

  private pollingTransactionCheckerStop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private pollingTransactionCheckerStart() {
    this.pollingTransactionCheckerStop();
    if (!this.isUnlocked) {
      return;
    }

    this.pollingInterval = setInterval(() => {
      this.checkActivityTransactions();
    }, 2000);
  }

  // START GENERATE SCRIPT
  public async generate() {
    const localId = this.creatorController.tokenLocalId;
    if (!localId) {
      throw new Error('LocalId from multisigner creator not found!');
    }
    return this.getControllerByLocalId(localId).generate();
  }

  public async add(multisignId: string) {
    try {
      const promise = await Promise.all(
        [...this.controllers].map(([_, c]) => c.add(multisignId)),
      );
      promise.forEach((p) => console.log(p));
    } catch (err) {
      console.error(err.message);
    }
  }

  public async remove(multisignId: string, chain: string) {
    return this.getControllerByLocalId(chain).remove(multisignId);
  }

  public async transactionWeight(
    payload: IMultisignerTransactionWeight,
  ): Promise<any> {
    const provider = this.allMultisigns.get(payload.id)?.provider;
    if (!provider) {
      throw new Error('Unexpected exceptions!');
    }
    const chain = provider.contract || provider.chainId;
    return this.getControllerByLocalId(chain).transactionWeight(payload);
  }

  public async transactionCreate(
    payload: IMultisignerTransactionCreate,
  ): Promise<any> {
    const provider = this.allMultisigns.get(payload.id)?.provider;
    if (!provider) {
      throw new Error('Unexpected exceptions!');
    }
    const chain = provider.contract || provider.chainId;
    return this.getControllerByLocalId(chain).transactionCreate(payload);
  }

  public async transactionSign(payload: { txId: string; chain: string }) {
    return this.getControllerByLocalId(payload.chain).transactionSign(
      payload.txId,
    );
  }

  public async transactionDecline(payload: { txId: string; chain: string }) {
    return this.getControllerByLocalId(payload.chain).transactionDecline(
      payload.txId,
    );
  }
}

export default Multisigner;
