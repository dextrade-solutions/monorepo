import TronWeb from 'tronweb-fetch/dist/TronWeb';
import { ObservableStore } from '@metamask/obs-store';
import PreferencesController from '../../preferences';
import { ControllerState } from '../types';

import { SECOND } from '../../../../../shared/constants/time';

import { TronNormalizer } from './tron-normalizer';
import { TronRequester } from './tron-requester';
import { INormalizeIncomeTransaction, TGetAccount } from './types';

export default class IncomingTransactions {
  public readonly _client: typeof TronWeb;

  private readonly preferencesController: PreferencesController;

  private readonly chainControllerStore: ObservableStore<ControllerState>;

  private readonly chainId: string;

  private _pollingInterval: number;

  private intervalId: NodeJS.Timeout | null = null;

  private requester: TronRequester;

  private normalizer: TronNormalizer;

  constructor({
    client,
    getAccount,
    preferencesController,
    chainControllerStore,
    chainId,
  }: {
    client: typeof TronWeb;
    getAccount: TGetAccount;
    preferencesController: PreferencesController;
    chainControllerStore: ObservableStore<ControllerState>;
    chainId: string;
  }) {
    this._pollingInterval = 15 * SECOND;

    this.preferencesController = preferencesController;
    this.chainControllerStore = chainControllerStore;
    this.chainId = chainId;

    this._client = client;
    const selectedAddress = this.preferencesController.getSelectedAddress();
    this.requester = new TronRequester({
      client: this._client,
      getAccount,
    });
    this.normalizer = new TronNormalizer({
      selectedAddress,
      chainId: this.chainId,
      client: this._client,
    });
  }

  private updateIncomeTransactions(data: INormalizeIncomeTransaction[]) {
    const currentState = this.chainControllerStore.getState();

    const incomeData = data.filter(
      (tx) => !currentState.incomingTransactions[tx.hash],
    );

    this.chainControllerStore.updateState({
      incomingTransactions: incomeData.reduce(
        (transactions, tx) => {
          transactions[tx.hash] = tx;
          return transactions;
        },
        {
          ...currentState.incomingTransactions,
        },
      ),
    });
  }

  private clearStore() {
    this.chainControllerStore.updateState({
      incomingTransactions: {},
    });
  }

  private async updateTRC20IncomeTransactions() {
    try {
      const data = await this.requester.getTRC20IncomeTransactions();
      const currentState = this.chainControllerStore.getState();
      const incomeNormalizeData = await Promise.all(
        data
          .filter((tx) => !currentState.incomingTransactions[tx.transaction_id])
          .map((iTx) => this.normalizer.normalizeTRC20FromRequest(iTx)),
      );

      if (incomeNormalizeData.length) {
        this.updateIncomeTransactions(incomeNormalizeData);
      }
      return incomeNormalizeData;
    } catch (err) {
      console.error('UPDATE income TRC20 balance error', err);
    }
    return [];
  }

  private async updateTRXIncomeTransactions() {
    try {
      const data = await this.requester.getTRXIncomeTransactions();

      const currentState = this.chainControllerStore.getState();
      const incomeNormalizeData = data
        .filter((tx) => !currentState.incomingTransactions[tx.txID])
        .map((tx) => this.normalizer.normalizeTRXTFromRequest(tx));

      if (incomeNormalizeData.length) {
        this.updateIncomeTransactions(incomeNormalizeData);
      }
      return incomeNormalizeData;
    } catch (err) {
      console.error('UPDATE income TRX balance error', err);
    }
    return [];
  }

  start() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        Promise.all([
          this.updateTRC20IncomeTransactions(),
          this.updateTRXIncomeTransactions(),
        ]);
      }, this._pollingInterval);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.clearStore();
  }
}
