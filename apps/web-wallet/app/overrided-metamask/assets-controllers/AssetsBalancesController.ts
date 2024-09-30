import EventEmitter from 'events';
import { flatten } from 'lodash';
import {
  BaseController,
  BaseConfig,
  BaseState,
  BaseControllerV1,
} from '@metamask/base-controller';
import { safelyExecute } from '@metamask/controller-utils';
import type { PreferencesState } from '@metamask/preferences-controller';
import MultisignerController from '../../scripts/controllers/multisigner/multisigner-controller';
import { SECOND } from '../../../shared/constants/time';
import ChainsController from '../../scripts/controllers/chains-controller';
import { IMultisign } from '../../scripts/controllers/multisigner/types';
import { Asset } from '../../../shared/lib/asset-model';

export interface AssetBalance {
  localId: string;
  account: string;
  balance: string;
  balanceError?: string | null;
}

/**
 * @type TokenBalancesConfig
 *
 * Token balances controller configuration
 * @property interval - Polling interval used to fetch new token balances
 * @property tokens - List of tokens to track balances for
 */
export interface TokenBalancesConfig extends BaseConfig {
  interval: number;
  tokens: Asset[];
}

export interface TokenBalancesState extends BaseState {
  balances: { [address: string]: AssetBalance[] };
  pendingTokens: { [localId: string]: Asset };
}

/**
 * Controller that passively polls on a set interval token balances
 * for assets stored in the TokensController
 */
export class AssetBalancesController extends BaseControllerV1<
  TokenBalancesConfig,
  TokenBalancesState
> {
  public hub = new EventEmitter();

  private handle?: ReturnType<typeof setTimeout>;

  private intervalId?: ReturnType<typeof setTimeout>;

  /**
   * Name of this controller used during composition
   */
  override name = 'AssetBalancesController';

  private getSelectedAddress: () => PreferencesState['selectedAddress'];

  private getTokens: () => Asset[];

  private readonly getMultisigns: () => Map<string, IMultisign>;

  private chainsController: ChainsController;

  private readonly multisignerController: MultisignerController;

  #enabled;

  /**
   * Creates a AssetBalancesController instance.
   *
   * @param options - The controller options.
   * @param options.getTokens - Gets the current tokens
   * @param options.getSelectedAddress - Gets the current selected address.
   * @param options.multisignerController
   * @param options.chainsController
   * @param options.config
   * @param options.state
   */
  constructor({
    getTokens,
    getSelectedAddress,
    chainsController,
    multisignerController,
    config,
    state,
  }: {
    getTokens: () => Asset[];
    getSelectedAddress: () => PreferencesState['selectedAddress'];
    chainsController: ChainsController;
    multisignerController: MultisignerController;
    config?: Partial<TokenBalancesConfig>;
    state?: Partial<TokenBalancesState>;
  }) {
    super(config, state);
    this.defaultConfig = {
      interval: 15 * SECOND,
      tokens: [],
    };
    this.chainsController = chainsController;
    this.multisignerController = multisignerController;
    this.defaultState = { balances: {}, pendingTokens: {} };
    this.initialize();
    this.getSelectedAddress = getSelectedAddress;
    this.getTokens = getTokens;
    this.getMultisigns = () => this.multisignerController.allMultisigns;
    this.#enabled = false;
  }

  async start() {
    this.#enabled = true;

    this.intervalId = setInterval(async () => {
      this.updateTokens();
    }, 1000);

    this.poll();
  }

  async stop() {
    if (this.handle) {
      clearInterval(this.handle);
      clearInterval(this.intervalId);
    }
    this.#enabled = false;
  }

  setPendingTokens(pendingTokens: { [localId: string]: Asset }) {
    this.update({
      pendingTokens,
    });
  }

  clearPendingTokens() {
    this.update({
      pendingTokens: {},
    });
  }

  representationMultisigTokens() {
    const multisigs = [];
    const representedTokens = [];
    for (const [, multisig] of multisigs) {
      // const controller = this.chainsController.getControllerByChainId(
      //   multisig.provider.chainId,
      // );
      // const localId = getTokenIdLocal({
      //   chainId: multisig.provider.chainId,
      // });
      representedTokens.push({
        localId: multisig.localId,
        account: multisig.account,
        // decimals: controller.info.nativeDecimals,
        // symbol: controller.info.nativeCurrency,
        // uid: controller.info.uid,
        // network: controller.info.network,
        // provider: multisig.provider,
        multisig,
      });
    }
    return representedTokens;
  }

  /**
   * Starts a new polling interval.
   *
   * @param interval - Polling interval used to fetch new token balances.
   */
  async poll(interval?: number): Promise<void> {
    interval && this.configure({ interval }, false, false);
    this.handle && clearTimeout(this.handle);
    await safelyExecute(() => this.updateBalances());
    this.handle = setTimeout(() => {
      this.poll(this.config.interval);
    }, this.config.interval);
  }

  // Calls every 1s interval.
  updateTokens() {
    const multisigTokens = this.representationMultisigTokens();
    const selectedAddress = this.getSelectedAddress();
    const balances = (this.state.balances || {})[selectedAddress] || [];
    const currentTokenWithBalances = [...balances];

    const mapF = (token: any): AssetBalance => {
      const existingToken =
        currentTokenWithBalances.find(
          (balance) =>
            balance.localId === token.localId &&
            balance.account === token.account,
        ) || {};

      return {
        localId: token.localId,
        account: token.account,

        balance: '0',

        ...existingToken,
      };
    };

    this.update({
      balances: {
        ...this.state.balances,
        [selectedAddress]: [
          ...this.getTokens().map(mapF),
          ...multisigTokens.map(mapF),
          ...Object.values(this.state.pendingTokens).map(mapF),
        ],
      },
    });
  }

  /**
   * Updates balances for all tokens.
   */
  async updateBalances(): Promise<void> {
    if (!this.#enabled) {
      return;
    }

    const selectedAddress = this.getSelectedAddress();
    const currentTokens = this.state.balances[selectedAddress];

    const groupedTokensByChainId = currentTokens.reduce((acc, token) => {
      const [chainId] = token.localId.split(':');
      const tokens = acc.get(chainId) || [];
      if (token.account) {
        acc.set(chainId, [...tokens, token]);
      }
      return acc;
    }, new Map<string, AssetBalance[]>());

    const requests: Promise<AssetBalance[]>[] = [];

    groupedTokensByChainId.forEach(
      (tokens: AssetBalance[], chainId: string) => {
        let controller;
        try {
          controller = this.chainsController.getControllerByChainId(chainId);
          requests.push(controller.getBalanceMulti(tokens));
        } catch (err) {
          requests.push(Promise.resolve(tokens));
        }
      },
    );
    const updatedTokens = flatten(await Promise.all(requests));

    this.hub.emit('balances:updated', updatedTokens);
    this.update({
      balances: {
        ...this.state.balances,
        [selectedAddress]: updatedTokens,
      },
    });
  }
}

export default AssetBalancesController;
