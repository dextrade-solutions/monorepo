import { Address, Transaction } from '@ton/core';
import { toHex } from '@metamask/controller-utils';
import { SECOND } from '../../../../../shared/constants/time';
import createId from '../../../../../shared/modules/random-id';
import {
  TransactionStatus,
  TransactionType,
} from '../../../../../shared/constants/transaction';
import TonController from '.';

export default class IncomingTransactions {
  private readonly tonController: TonController;

  private intervalId: NodeJS.Timeout | null = null;

  constructor(tonController: TonController) {
    this.tonController = tonController;
  }

  #parseTransaction(tx: Transaction) {
    const hash = Buffer.from(tx.hash()).toString('hex');
    const { info } = tx.inMessage || {};

    if (!info?.value?.coins) {
      throw new Error('ton parse transaction - unknown transaction type');
    }
    const from = info.src?.toString();
    const to = info.dest?.toString();

    const txParams = {
      from,
      to,
      value: toHex(info.value.coins),
      localId: this.tonController.chainId,
    };

    return {
      id: createId(),
      hash,
      chainId: this.tonController.chainId,
      status: TransactionStatus.confirmed,
      time: tx.now * 1000,
      txParams,
      walletAddress: this.tonController.walletAddressRoot,
      type:
        to === this.tonController.walletAddressChain
          ? TransactionType.incoming
          : TransactionType.simpleSend,
    };
  }

  private async updateIncomeTransactions() {
    const address = Address.parse(
      this.tonController.getCurrentAccount().nativeAddress,
    );
    const result = await this.tonController.client.getTransactions(address, {
      limit: 5,
    });

    const currentState = this.tonController.store.getState();

    this.tonController.store.updateState({
      incomingTransactions: result.reduce(
        (transactions, tx) => {
          try {
            const parsedTx = this.#parseTransaction(tx);
            if (parsedTx.type === TransactionType.incoming) {
              transactions[parsedTx.hash] = parsedTx;
            }
          } catch (e) {
            // ignore
          }
          return transactions;
        },
        {
          ...currentState.incomingTransactions,
        },
      ),
    });
  }

  start() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.updateIncomeTransactions();
      }, 15 * SECOND);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
