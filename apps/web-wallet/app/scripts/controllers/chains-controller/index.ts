import { EventEmitter } from 'events';
import { ObservableStore } from '@metamask/obs-store';

import { isSafeChainId } from '@metamask/controller-utils';
import { v4 as random } from 'uuid';

import { HDKey } from 'ethereum-cryptography/hdkey';
import { KeyringController } from '../../../overrided-metamask/eth-keyring-controller';
import { previousValueComparator } from '../../lib/util';

import {
  CHAIN_IDS,
  CHAIN_ID_TO_NETWORK_MAP,
  NETWORK_TO_NAME_MAP,
  NETWORK_TYPES,
  TEST_CHAINS,
} from '../../../../shared/constants/network';

import PreferencesController from '../preferences';
import OnboardingController from '../onboarding';

import { getBuiltInChains } from '../../../../shared/shared-chain-provider';
import { AssetBalance } from '../../../overrided-metamask/assets-controllers';
import { isPrefixedFormattedHexString } from '../../../../shared/modules/network.utils';
import { EVENT } from '../../../../shared/constants/metametrics';
import { ORIGIN_METAMASK } from '../../../../shared/constants/app';
import EthereumController from './ethereum';
import TronController from './tron';
import BitcoinController from './bitcoin';
import TonController from './ton';

import {
  ChainControllerOptions,
  ChainId,
  ChainsControllerState,
  ControllerState,
  UpsertNetworkParams,
} from './types';
import { NetworkConfiguration } from 'shared/shared-chain-provider/types';

const getDefaultStateController = () => ({
  id: random(),
  config: null, // default configuration network
  incomingTransactions: {},

  network: {
    EIPS: {},
    networkVersion: null,
    latestBlock: null,
  },

  accounts: {},
});

const defaultState: ChainsControllerState = {
  defaultChain: CHAIN_IDS.MAINNET,
  usedNetworks: {},
};
type Controllers = EthereumController | BitcoinController | TronController;
type ActiveControllers = { [key: ChainId]: Controllers };

export default class ChainsController extends EventEmitter {
  store: ObservableStore<ChainsControllerState>;

  onboardingController: OnboardingController;

  preferencesController: PreferencesController;

  keyringController: KeyringController;

  activeControllers: ActiveControllers = {};

  onChangeAddressEvents: ((address: string) => any)[] = [];

  initActiveChainsTokens: () => void;

  deriveHdKey: (level: number) => Promise<HDKey>;

  constructor({
    state = { ...defaultState },
    preferencesController,
    onboardingController,
    keyringController,
    initActiveChainsTokens,
    deriveHdKey,
  }: {
    state: ChainsControllerState;
    preferencesController: PreferencesController;
    onboardingController: OnboardingController;
    keyringController: KeyringController;
    initActiveChainsTokens: () => void;
    deriveHdKey: (level: number) => Promise<HDKey>;
  }) {
    super();
    this.deriveHdKey = deriveHdKey;
    this.preferencesController = preferencesController;
    this.onboardingController = onboardingController;
    this.keyringController = keyringController;
    this.store = new ObservableStore(state);
    this.initActiveChainsTokens = initActiveChainsTokens;

    this.preferencesController.store.subscribe(
      previousValueComparator(async (prevState: any, currState: any) => {
        const { selectedAddress: prevSelectedAddress } = prevState;
        const { selectedAddress: currSelectedAddress } = currState;

        if (currSelectedAddress === prevSelectedAddress) {
          return;
        }

        this.onChangeAddressEvents.forEach((event) => {
          event(currSelectedAddress);
        });
      }, this.preferencesController.store.getState()),
    );

    this.init();
  }

  public isTestnet(provider: any): boolean {
    return TEST_CHAINS.some((chainId: string) => chainId === provider.chainId);
  }

  public get state(): ChainsControllerState {
    return this.store.getState();
  }

  public get defaultChain(): ChainId {
    return this.state.defaultChain || CHAIN_IDS.MAINNET;
  }

  public upsertNetworkConfiguration(
    {
      rpcUrl,
      chainId,
      ticker,
      decimals,
      nickname,
      rpcPrefs,
    }: UpsertNetworkParams,
    { referrer, source }: { referrer: string; source: string },
  ) {
    const isAddingCustomNetwork =
      source !== EVENT.SOURCE.NETWORK.CHAINS_CONTROLLER;
    if (isAddingCustomNetwork) {
      if (!isPrefixedFormattedHexString(chainId)) {
        console.warn(`Invalid chain ID "${chainId}": invalid hex string.`);
      }

      if (!isSafeChainId(chainId)) {
        console.warn(
          `Invalid chain ID "${chainId}": numerical value greater than max safe value.`,
        );
      }

      if (!rpcUrl) {
        throw new Error(
          'An rpcUrl is required to add or update network configuration',
        );
      }

      if (!referrer || !source) {
        throw new Error(
          'referrer and source are required arguments for adding or updating a network configuration',
        );
      }

      try {
        // eslint-disable-next-line no-new
        new URL(rpcUrl);
      } catch (e: any) {
        if (e.message.includes('Invalid URL')) {
          throw new Error('rpcUrl must be a valid URL');
        }
      }

      if (!ticker) {
        throw new Error(
          'A ticker is required to add or update networkConfiguration',
        );
      }
    }

    const newNetworkConfiguration: NetworkConfiguration = {
      rpcUrl,
      chainId,
      ticker,
      decimals,
      nickname,
      network: CHAIN_ID_TO_NETWORK_MAP[chainId] || 'rpc',
      blockExplorerUrl: rpcPrefs.blockExplorerUrl,
    };
    let controller;
    try {
      controller = this.getControllerByChainId(chainId);
    } catch (e) {
      // ignore
    }

    if (!controller) {
      controller = this.buildController(newNetworkConfiguration);
    }

    controller.store.subscribe((data: ControllerState) => {
      this.store.updateState({
        usedNetworks: {
          ...this.store.getState().usedNetworks,
          [chainId]: data,
        },
      });
    });

    controller.store.updateState({
      config: {
        ...controller.store.getState().config,
        ...newNetworkConfiguration,
      },
    });
    this.activeControllers[chainId] = controller;
    if (isAddingCustomNetwork) {
      controller.start();
      this.initActiveChainsTokens();
    }
    return chainId;
  }

  async removeChain(chainId: ChainId) {
    const controller = this.getControllerByChainId(chainId);
    controller.destroy();
    const { usedNetworks } = this.store.getState();
    delete usedNetworks[chainId];
    delete this.activeControllers[chainId];
    this.store.updateState({
      usedNetworks,
    });
    this.emit('chain:removed', chainId);
  }

  #getActiveChainConfigurations() {
    const addedChains = Object.values(
      this.store.getState().usedNetworks || {},
    ).map(({ config }) => config);
    if (!addedChains.length) {
      return getBuiltInChains();
    }
    return addedChains;
  }

  init() {
    this.#getActiveChainConfigurations().forEach((netConfig) =>
      this.upsertNetworkConfiguration(
        {
          nickname:
            netConfig.nickname || NETWORK_TO_NAME_MAP[netConfig.chainId],
          chainId: netConfig.chainId,
          ticker: netConfig.ticker,
          rpcUrl: netConfig.rpcUrl,
          decimals: netConfig.decimals,
          rpcPrefs: {
            blockExplorerUrl: netConfig.blockExplorerUrl,
          },
        },
        {
          referrer: ORIGIN_METAMASK,
          source: EVENT.SOURCE.NETWORK.CHAINS_CONTROLLER,
        },
      ),
    );
    this.emit('initialized');
  }

  isInitialized() {
    return this.#getActiveChainConfigurations().every(({ chainId }) =>
      Boolean(this.activeControllers[chainId]),
    );
  }

  onChangeAddressSubscribe(cb) {
    this.onChangeAddressEvents.push(cb);
  }

  buildController(networkConfiguration: NetworkConfiguration) {
    const opts: ChainControllerOptions = {
      state: this.getNetState(networkConfiguration),
      networkConfiguration,
      keyringController: this.keyringController,
      preferencesController: this.preferencesController,
      onboardingController: this.onboardingController,
      isTestnet: TEST_CHAINS.some(
        (chainId) => chainId === networkConfiguration.chainId,
      ),
      deriveHdKey: this.deriveHdKey.bind(this),
    };

    switch (networkConfiguration.chainId) {
      case CHAIN_IDS.BTC:
      case CHAIN_IDS.BTC_TESTNET:
        return new BitcoinController(opts);
      case CHAIN_IDS.TRON:
      case CHAIN_IDS.TRON_TESTNET:
        return new TronController(opts);
      case CHAIN_IDS.TON:
        return new TonController(opts);
      default:
        if (networkConfiguration.chainId.startsWith('0x')) {
          return new EthereumController(opts);
        }
        throw new Error(
          `buildController - Unknown chainId ${networkConfiguration.chainId}`,
        );
    }
  }

  /**
   * @deprecated - use getControllerByChainId instead
   * @param provider
   */
  getControllerByProvider(provider: any) {
    const controller = this.activeControllers[provider.chainId];
    if (!controller) {
      throw new Error('Not found chain controller by specified provider');
    }
    return controller;
  }

  setActiveChain(chainId: ChainId) {
    this.store.updateState({
      defaultChain: chainId,
    });
  }

  /**
   * Current default controller.
   * Need for EIP6963 or WalletConnect to response current chain.
   *
   * @returns
   */
  getDefaultController() {
    try {
      return this.getControllerByChainId(this.defaultChain);
    } catch {
      return null;
    }
  }

  getControllerByChainId(chainId: string) {
    const controller = this.activeControllers[chainId];
    if (!controller) {
      throw new Error(
        `Not found chain controller by specified chainId ${chainId}`,
      );
    }
    return controller;
  }

  async getBalances(
    chainId: string,
    tokens: AssetBalance[],
  ): Promise<AssetBalance[]> {
    const chainController = this.getControllerByChainId(chainId);
    if (!('getBalanceMulti' in chainController)) {
      throw new Error(
        `Fetch multi address balance not supported for this chain provider`,
      );
    }
    const result = (await chainController.getBalanceMulti(
      tokens,
    )) as AssetBalance[];
    return result;
  }

  getNetState(netConfig: NetworkConfiguration) {
    const state =
      this.store.getState().usedNetworks[netConfig.chainId] ||
      getDefaultStateController();
    return Object.assign(state, { config: netConfig });
  }

  start() {
    Object.values(this.activeControllers).forEach((controller) => {
      controller.start();
    });
  }

  stop() {
    Object.values(this.activeControllers).forEach((controller) => {
      controller.stop();
    });
  }
}
