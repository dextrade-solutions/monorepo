import EventEmitter from 'safe-event-emitter';
import log from 'loglevel';
import {
  TransactionStatus,
  TransactionType,
} from '../../../../shared/constants/transaction';
import { SECOND } from '../../../../shared/constants/time';
import {
  ExchangeP2PStatus,
  ExchangeStatuses,
  ExchangerType,
} from '../../../../shared/constants/exchanger';
import { ERROR_SUBMITTING } from './tx-state-manager';

/**
 * Event emitter utility class for tracking the transactions as they
 * go from a pending state to a confirmed (mined in a block) state.
 *
 * As well as continues broadcast while in the pending state.
 */
export default class PendingTransactionTracker extends EventEmitter {
  /**
   * We wait this many blocks before emitting a 'tx:dropped' event
   *
   * This is because we could be talking to a node that is out of sync.
   *
   * @type {number}
   */
  DROPPED_BUFFER_COUNT = 3;

  INTERVAL = SECOND * 5;

  /**
   * A map of transaction hashes to the number of blocks we've seen
   * since first considering it dropped
   *
   * @type {Map<string, number>}
   */
  droppedBlocksBufferByHash = new Map();

  intervalId;

  /**
   * @param {object} config - Configuration.
   * @param {Function} config.approveTransaction - Approves a transaction.
   * @param {Function} config.confirmTransaction - Set a transaction as confirmed.
   * @param {Function} config.getCompletedTransactions - Returns completed transactions.
   * @param {Function} config.getPendingTransactions - Returns an array of pending transactions,
   * @param {object} config.nonceTracker - see nonce tracker
   * @param {object} config.provider - A network provider.
   * @param {object} config.query - An EthQuery instance.
   * @param {Function} config.publishTransaction - Publishes a raw transaction,
   */
  constructor(config) {
    super();
    // this.query = config.query || new EthQuery(config.provider);
    // this.nonceTracker = config.nonceTracker;
    this.getPendingTransactions = config.getPendingTransactions;
    this.getCompletedTransactions = config.getCompletedTransactions;
    this.publishTransaction = config.publishTransaction;
    this.approveTransaction = config.approveTransaction;
    this.confirmTransaction = config.confirmTransaction;
    this.chainsController = config.chainsController;
  }

  start() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(
      this.updatePendingTxs.bind(this),
      this.INTERVAL,
    );
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * checks the network for signed txs and releases the nonce global lock if it is
   */
  async updatePendingTxs() {
    // in order to keep the nonceTracker accurate we block it while updating pending transactions
    // const nonceGlobalLock = await this.nonceTracker.getGlobalLock();
    try {
      const pendingTxs = this.getPendingTransactions();
      await Promise.all(
        pendingTxs.map((txMeta) => this._checkPendingTx(txMeta)),
      );
    } catch (err) {
      log.error(
        'PendingTransactionTracker - Error updating pending transactions',
      );
      log.error(err);
    }
    // nonceGlobalLock.releaseLock();
  }

  /**
   * Resubmits each pending transaction
   *
   * @param {string} blockNumber - the latest block number in hex
   * @fires tx:warning
   * @returns {Promise<void>}
   */
  async resubmitPendingTxs(blockNumber) {
    const pending = this.getPendingTransactions();
    if (!pending.length) {
      return;
    }
    for (const txMeta of pending) {
      try {
        await this._resubmitTx(txMeta, blockNumber);
      } catch (err) {
        const errorMessage =
          err.value?.message?.toLowerCase() || err.message.toLowerCase();
        const isKnownTx =
          // geth
          errorMessage.includes('replacement transaction underpriced') ||
          errorMessage.includes('known transaction') ||
          // parity
          errorMessage.includes('gas price too low to replace') ||
          errorMessage.includes(
            'transaction with the same hash was already imported',
          ) ||
          // other
          errorMessage.includes('gateway timeout') ||
          errorMessage.includes('nonce too low');
        // ignore resubmit warnings, return early
        if (isKnownTx) {
          return;
        }
        // encountered real error - transition to error state
        txMeta.warning = {
          error: errorMessage,
          message: ERROR_SUBMITTING,
        };
        this.emit('tx:warning', txMeta, err);
      }
    }
  }

  /**
   * Attempts to resubmit the given transaction with exponential backoff
   *
   * Will only attempt to retry the given tx every {@code 2**(txMeta.retryCount)} blocks.
   *
   * @param {object} txMeta - the transaction metadata
   * @param {string} latestBlockNumber - the latest block number in hex
   * @returns {Promise<string|undefined>} the tx hash if retried
   * @fires tx:block-update
   * @fires tx:retry
   * @private
   */
  async _resubmitTx(txMeta, latestBlockNumber) {
    if (!txMeta.firstRetryBlockNumber) {
      this.emit('tx:block-update', txMeta, latestBlockNumber);
    }

    const firstRetryBlockNumber =
      txMeta.firstRetryBlockNumber || latestBlockNumber;
    const txBlockDistance =
      Number.parseInt(latestBlockNumber, 16) -
      Number.parseInt(firstRetryBlockNumber, 16);

    const retryCount = txMeta.retryCount || 0;

    // Exponential backoff to limit retries at publishing (capped at ~15 minutes between retries)
    if (txBlockDistance < Math.min(50, Math.pow(2, retryCount))) {
      return undefined;
    }

    // Only auto-submit already-signed txs:
    if (!('rawTx' in txMeta)) {
      return this.approveTransaction(txMeta.id);
    }

    const { rawTx } = txMeta;
    const txHash = await this.publishTransaction(rawTx);

    // Increment successful tries:
    this.emit('tx:retry', txMeta);
    return txHash;
  }

  /**
   * Query the network to see if the given {@code txMeta} has been included in a block
   *
   * @param {object} txMeta - the transaction metadata
   * @returns {Promise<void>}
   * @fires tx:confirmed
   * @fires tx:dropped
   * @fires tx:failed
   * @fires tx:warning
   * @private
   */

  async _checkPendingTx(txMeta) {
    const txId = txMeta.id;
    const { exchangerSettings, exchangerType, txParams, type } = txMeta;

    const isP2PSwap = [
      ExchangerType.P2PClient,
      ExchangerType.P2PExchanger,
    ].includes(exchangerType);

    const canBeConfirmed =
      (isP2PSwap &&
        type !== TransactionType.atomicSwap &&
        exchangerSettings.status === ExchangeP2PStatus.completed) ||
      !isP2PSwap;

    if (isP2PSwap) {
      if (exchangerSettings.status === ExchangeStatuses.canceled) {
        this.emit(`tx:status-update`, txId, TransactionStatus.rejected);
        return;
      }
    }
    // Only check submitted txs
    // if (txMeta.status !== TransactionStatus.submitted) {
    //   return;
    // }

    // extra check in case there was an uncaught error during the
    // signature and submission process

    // NOTE: Commented now because TON transactions dont have id until tx is committed to blockchain
    // if (!txHash) {
    //   const noTxHashErr = new Error(
    //     'We had an error while submitting this transaction, please try again.',
    //   );
    //   noTxHashErr.name = 'NoTxHashError';
    //   this.emit('tx:failed', txId, noTxHashErr);

    //   return;
    // }

    // if (txMeta.isEthTypeNetwork && (await this._checkIfNonceIsTaken(txMeta))) {
    //   this.emit('tx:dropped', txId);
    //   return;
    // }
    try {
      const [chainId] = txParams.localId.split(':');
      const chainController =
        this.chainsController.getControllerByChainId(chainId);

      const transactionReceipt = await chainController.getTransactionReceipt(
        txMeta,
      );
      if (transactionReceipt && canBeConfirmed) {
        this.emit('tx:confirmed', txId, transactionReceipt);
        return;
      }
    } catch (err) {
      txMeta.warning = {
        error: err.message,
        message: 'There was a problem loading this transaction.',
      };
      this.emit('tx:warning', txMeta, err);
    }

    // if (
    //   txMeta.isEthTypeNetwork &&
    //   (await this._checkIfTxWasDropped(txMeta, chainProvider))
    // ) {
    //   this.emit('tx:dropped', txId);
    // }
  }

  /**
   * Checks whether the nonce in the given {@code txMeta} is behind the network nonce
   *
   * @param {object} txMeta - the transaction metadata
   * @returns {Promise<boolean>}
   * @private
   */
  async _checkIfTxWasDropped(txMeta) {
    const {
      hash: txHash,
      txParams: { nonce, from },
    } = txMeta;
    const networkNextNonce =
      await chainProvider.chain.client.getTransactionCount(from);

    if (parseInt(nonce, 16) >= networkNextNonce.toNumber()) {
      return false;
    }

    if (!this.droppedBlocksBufferByHash.has(txHash)) {
      this.droppedBlocksBufferByHash.set(txHash, 0);
    }

    const currentBlockBuffer = this.droppedBlocksBufferByHash.get(txHash);

    if (currentBlockBuffer < this.DROPPED_BUFFER_COUNT) {
      this.droppedBlocksBufferByHash.set(txHash, currentBlockBuffer + 1);
      return false;
    }

    this.droppedBlocksBufferByHash.delete(txHash);
    return true;
  }

  /**
   * Checks whether the nonce in the given {@code txMeta} is correct against the local set of transactions
   *
   * @param {object} txMeta - the transaction metadata
   * @returns {Promise<boolean>}
   * @private
   */
  async _checkIfNonceIsTaken(txMeta) {
    const address = txMeta.txParams.from;
    const completed = this.getCompletedTransactions(address);
    return completed.some(
      // This is called while the transaction is in-flight, so it is possible that the
      // list of completed transactions now includes the transaction we were looking at
      // and if that is the case, don't consider the transaction to have taken its own nonce
      (other) =>
        !(other.id === txMeta.id) &&
        other.txParams.nonce === txMeta.txParams.nonce,
    );
  }
}
