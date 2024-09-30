import { addHexPrefix } from 'ethereumjs-util';
import { SECOND } from '../../../../../shared/constants/time';
import {
  TransactionStatus,
  TransactionType,
} from '../../../../../shared/constants/transaction';
import createId from '../../../../../shared/modules/random-id';

import BitcoinChainController from './interface';
import {
  BlockChainInfoInput,
  BlockChainInfoOutput,
  BlockChainInfoTx,
} from './types';

/**
 * Only works with mainnet
 */
export default class IncomingTransactions {
  public readonly controller: BitcoinChainController;

  private _pollingInterval: number;

  private intervalId: NodeJS.Timeout | null = null;

  constructor(controller: BitcoinChainController) {
    this.controller = controller;
    this._pollingInterval = 4 * SECOND;
  }

  private get selectedAddress() {
    return this.controller.preferencesController.store.getState()
      .selectedAddress;
  }

  private updateIncomeTransactions(data: any) {
    const currentState = this.controller.store.getState();

    const incomeData = data.filter(
      (tx: any) => !currentState.incomingTransactions[tx.hash],
    );

    this.controller.store.updateState({
      incomingTransactions: incomeData.reduce(
        (transactions: any, tx: any) => {
          transactions[tx.hash] = tx;
          return transactions;
        },
        {
          ...currentState.incomingTransactions,
        },
      ),
    });
  }

  private findSelfInOutput(outputs: BlockChainInfoOutput[], exclude = false) {
    // const { nativeAddress } = this.controller.getCurrentAccount();
    if (exclude) {
      // return outputs.find((out) => out.addr !== nativeAddress);
      return outputs.find(
        (out) => !this.controller.txsAddress.includes(out.addr),
      );
    }
    // return outputs.find((out) => out.addr === nativeAddress);
    return outputs.find((out) => this.controller.txsAddress.includes(out.addr));
  }

  private findSelfInput(inputs: BlockChainInfoInput[]) {
    // eslint-disable-next-line camelcase
    const inputsPrevOut = inputs.map(({ prev_out }) => prev_out);
    return inputsPrevOut.find(
      (prevOut) => !this.controller.txsAddress.includes(prevOut.addr),
    );
  }

  private normalizeFromRequest(tx: BlockChainInfoTx) {
    const outputTo = this.findSelfInOutput(tx.out, false);
    // const outputFrom = this.findSelfInOutput(tx.out, true);
    const outputFrom = this.findSelfInput(tx.inputs);

    if (!outputTo || !outputFrom) {
      console.error('Invalid or non-standard transaction');
      return null;
      // throw new Error('Invalid or non-standard transaction');
    }

    const txParams = {
      from: outputFrom.addr,
      to: outputTo.addr,
      value: addHexPrefix(tx.result.toString(16)), // convert to hex
      localId: this.controller.chainId,
    };

    return {
      status: TransactionStatus.confirmed,
      txReceipt: {
        feeUsed: addHexPrefix(tx.fee.toString(16)), // convert to hex
      },
      walletAddress: this.selectedAddress,
      blockNumber: tx.block_height,
      id: createId(),
      chainId: this.controller.chainId,
      time: tx.time * 1000,
      txParams,
      hash: tx.hash,
      type: TransactionType.incoming,
    };
  }

  private async fetchIncomeTransactions() {
    try {
      const currentState = this.controller.store.getState();
      const incomeNormalizeData = this.controller.txsInfo
        .filter((tx) => !currentState.incomingTransactions[tx.hash])
        .map((tx) => this.normalizeFromRequest(tx))
        .filter((tx) => Boolean(tx));

      if (incomeNormalizeData.length) {
        this.updateIncomeTransactions(incomeNormalizeData);
      }
      return incomeNormalizeData;
    } catch (err) {
      console.error('Unable fetch bitcoin income transactions', err);
    }
    return [];
  }

  start() {
    if (!this.intervalId && !this.controller.isTestnet) {
      this.intervalId = setInterval(() => {
        this.fetchIncomeTransactions();
      }, this._pollingInterval);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
