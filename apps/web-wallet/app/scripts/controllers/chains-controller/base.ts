import { HDKey } from 'ethereum-cryptography/hdkey';
import { ObservableStore } from '@metamask/obs-store';
import OnboardingController from '../onboarding';
import PreferencesController from '../preferences';
import { SECOND } from '../../../../shared/constants/time';
import { AssetBalance } from '../../../overrided-metamask/assets-controllers';
import SharedChainProvider from '../../../../shared/shared-chain-provider/base';
import { getSharedProvider } from '../../../../shared/shared-chain-provider';
import { promiseWithTimeout } from '../../../../shared/modules/promise-utils';
import { ChainControllerOptions, ChainId, ControllerState } from './types';

export default abstract class BaseController {
  sharedProvider: SharedChainProvider;

  chainId: ChainId;

  rpcUrl?: string;

  isTestnet: boolean;

  blockTracker: any;

  preferencesController: PreferencesController;

  onboardingController: OnboardingController;

  store: ObservableStore<ControllerState>;

  deriveHdKey: (level: number) => Promise<HDKey>;

  queue: any[] = [];

  workingOnPromise = false;

  cooldown = 12 * SECOND;

  initialized = false;

  constructor({
    state,
    isTestnet,
    networkConfiguration,
    preferencesController,
    onboardingController,
    cooldown,
    deriveHdKey,
  }: ChainControllerOptions) {
    this.chainId = networkConfiguration.chainId;
    this.rpcUrl = networkConfiguration.rpcUrl;
    this.isTestnet = isTestnet;
    this.preferencesController = preferencesController;
    this.onboardingController = onboardingController;
    this.deriveHdKey = deriveHdKey;

    if (cooldown) {
      this.cooldown = cooldown;
    }

    this.store = new ObservableStore(state);
    this.sharedProvider = getSharedProvider(networkConfiguration);
  }

  get eip1559support() {
    const EIPS = this.store.getState().network.EIPS || {};
    return EIPS[1559];
  }

  get walletAddressRoot() {
    return this.preferencesController.getSelectedAddress();
  }

  get walletAddressChain() {
    return this.getCurrentAccount().nativeAddress;
  }

  abstract deriveAccount(hdKey: HDKey): any;

  abstract getBalance(_address: string): Promise<string>;

  abstract getTokenBalance(
    _contract: string,
    _address: string,
  ): Promise<string>;

  destroy() {
    this.stop();
    this.store.removeAllListeners();
  }

  async updateAccount() {
    const address = await this.getOrCreateAccountAddress();
    const result = await this.getBalance(address);
    this.updateCurrentAccount('nativeBalance', result.toString());
    this.updateCurrentAccount('info', {});
    return this.getCurrentAccount();
  }

  updateCurrentAccount(key: string, value: any) {
    this.store.updateState({
      accounts: {
        ...(this.store.getState().accounts || {}),
        [this.preferencesController.getSelectedAddress()]: {
          ...this.getCurrentAccount(),
          [key]: value,
        },
      },
    });
  }

  getCurrentAccount() {
    const allAccounts = this.store.getState().accounts || {};
    return allAccounts[this.preferencesController.getSelectedAddress()] || {};
  }

  async getOrCreateAccountAddress() {
    const { nativeAddress } = this.getCurrentAccount();
    if (nativeAddress) {
      return nativeAddress;
    }
    const hdKey = await this.deriveHdKey(0);
    const { address } = this.deriveAccount(hdKey);
    this.updateCurrentAccount('nativeAddress', address);
    this.updateCurrentAccount('created', Date.now());

    return address;
  }

  async getCurrentAccountKeys() {
    const hdKey = await this.deriveHdKey(0);
    const { privateKey } = this.deriveAccount(hdKey);
    return { privateKey, hdKey };
  }

  async getBalanceMulti(balances: AssetBalance[]): Promise<AssetBalance[]> {
    const requests = balances.map((assetBalance) => {
      const wrapPromise = (balanceRequest: Promise<any>) =>
        promiseWithTimeout(
          balanceRequest,
          5 * SECOND,
          'getBalance timeout exceeded',
        )
          .then((balanceResponse: string | null) => ({
            ...assetBalance,
            balance: balanceResponse || assetBalance.balance,
            balanceError: null,
          }))
          .catch((e) => ({
            ...assetBalance,
            balanceError: String(e.message),
          }));
      const [, contract] = assetBalance.localId.split(':');
      if (contract) {
        return wrapPromise(
          this.getTokenBalance(contract, assetBalance.account),
        );
      }
      return wrapPromise(this.getBalance(assetBalance.account));
    });
    const results = await Promise.all(requests);
    return results;
  }

  enqueueWithCooldown(promise: (...args: any[]) => Promise<any>) {
    return new Promise((resolve, reject) => {
      const cooldownWrappedPromise = () =>
        new Promise((resolveCooldown) => {
          const timeout =
            (this.store.getState().lastRequestTimestamp || 0) -
            new Date().getTime();
          setTimeout(
            () => {
              resolveCooldown(promise);
            },
            timeout < 0 ? 0 : timeout,
          );
        });

      this.queue.push({
        cooldownWrappedPromise,
        resolve,
        reject,
      });
      this.dequeue();
    });
  }

  dequeue() {
    if (this.workingOnPromise) {
      return false;
    }
    const item = this.queue.shift();
    if (!item) {
      return false;
    }
    try {
      this.workingOnPromise = true;
      item
        .cooldownWrappedPromise()
        .then((promise: any) => {
          this.workingOnPromise = false;
          promise()
            .then((value: any) => {
              this.workingOnPromise = false;
              item.resolve(value);
              this.dequeue();
            })
            .catch((err: unknown) => {
              this.workingOnPromise = false;
              item.reject(err);
              this.dequeue();
            });
        })
        .finally(() => {
          this.store.updateState({
            lastRequestTimestamp: new Date().getTime() + this.cooldown,
          });
        });
    } catch (err) {
      this.workingOnPromise = false;
      item.reject(err);
      this.dequeue();
    }
    return true;
  }

  abstract start(): void;

  abstract stop(): void;
}
