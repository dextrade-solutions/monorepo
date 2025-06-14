import EventEmitter from 'safe-event-emitter';
import { ObservableStore } from '@metamask/obs-store';
import log from 'loglevel';
import { values, keyBy, mapValues, omitBy, pickBy, sortBy } from 'lodash';
import createId from '../../../../shared/modules/random-id';
import {
  IN_PROGRESS_TRANSACTION_STATUSES,
  TransactionStatus,
  TransactionType,
} from '../../../../shared/constants/transaction';
import { METAMASK_CONTROLLER_EVENTS } from '../../metamask-controller';
import { ORIGIN_METAMASK } from '../../../../shared/constants/app';
import {
  ExchangePairType,
  ExchangerType,
} from '../../../../shared/constants/exchanger';
import {
  generateHistoryEntry,
  replayHistory,
  snapshotFromTxMeta,
} from './lib/tx-state-history-helpers';
import {
  getFinalStates,
  normalizeAndValidateTxParams,
  validateConfirmedExternalTransaction,
} from './lib/util';

export const ERROR_SUBMITTING =
  'There was an error when resubmitting this transaction.';
/**
 * TransactionStatuses reimported from the shared transaction constants file
 *
 * @typedef {import(
 *  '../../../../shared/constants/transaction'
 * ).TransactionStatusString} TransactionStatusString
 */

/**
 * @typedef {import('../../../../shared/constants/transaction').TxParams} TxParams
 */

/**
 * @typedef {import(
 *  '../../../../shared/constants/transaction'
 * ).TransactionMeta} TransactionMeta
 */

/**
 * @typedef {object} TransactionState
 * @property {Record<string, TransactionMeta>} transactions - TransactionMeta
 *  keyed by the transaction's id.
 */

/**
 * TransactionStateManager is responsible for the state of a transaction and
 * storing the transaction. It also has some convenience methods for finding
 * subsets of transactions.
 *
 * @param {object} opts
 * @param {TransactionState} [opts.initState={ transactions: {} }] - initial
 *  transactions list keyed by id
 * @param {number} [opts.txHistoryLimit] - limit for how many finished
 *  transactions can hang around in state
 * @param {Function} opts.getNetworkState - Get the current network state.
 */
export default class TransactionStateManager extends EventEmitter {
  constructor({
    initState,
    txHistoryLimit,
    getNetworkState,
    getSelectedAddress,
    // getCurrentChainId,
  }) {
    super();

    this.store = new ObservableStore({
      transactions: {},
      ...initState,
    });
    this.txHistoryLimit = txHistoryLimit;
    this.getNetworkState = getNetworkState;
    this.getSelectedAddress = getSelectedAddress;
    // this.getCurrentChainId = getCurrentChainId;

    // this.unconfirmAllTransactions();
  }

  unconfirmAllTransactions() {
    const txs = this.getConfirmedTransactions();
    txs.forEach((txMeta) => {
      this.updateTransaction(
        { ...txMeta, status: TransactionStatus.submitted },
        'unconfirmed mannually',
      );
    });
  }

  /**
   * Generates a TransactionMeta object consisting of the fields required for
   * use throughout the extension. The argument here will override everything
   * in the resulting transaction meta.
   *
   * TODO: Don't overwrite everything?
   *
   * @param {Partial<TransactionMeta>} opts - the object to use when
   *  overwriting default keys of the TransactionMeta
   * @returns {TransactionMeta} the default txMeta object
   */
  generateTxMeta(opts = {}) {
    const netId = opts.chainId;
    const { chainId } = opts;

    let dappSuggestedGasFees = null;

    // If we are dealing with a transaction suggested by a dapp and not
    // an internally created metamask transaction, we need to keep record of
    // the originally submitted gasParams.
    if (
      opts.txParams &&
      typeof opts.origin === 'string' &&
      opts.origin !== ORIGIN_METAMASK
    ) {
      if (typeof opts.txParams.gasPrice !== 'undefined') {
        dappSuggestedGasFees = {
          gasPrice: opts.txParams.gasPrice,
        };
      } else if (
        typeof opts.txParams.maxFeePerGas !== 'undefined' ||
        typeof opts.txParams.maxPriorityFeePerGas !== 'undefined'
      ) {
        dappSuggestedGasFees = {
          maxPriorityFeePerGas: opts.txParams.maxPriorityFeePerGas,
          maxFeePerGas: opts.txParams.maxFeePerGas,
        };
      }

      if (typeof opts.txParams.gas !== 'undefined') {
        dappSuggestedGasFees = {
          ...dappSuggestedGasFees,
          gas: opts.txParams.gas,
        };
      }
    }

    return {
      id: createId(),
      time: new Date().getTime(),
      status: TransactionStatus.unapproved,
      walletAddress: this.getSelectedAddress(),
      metamaskNetworkId: netId,
      originalGasEstimate: opts.txParams?.gas,
      userEditedGasLimit: false,
      chainId,
      loadingDefaults: true,
      dappSuggestedGasFees,
      sendFlowHistory: [],
      ...opts,
    };
  }

  /**
   * Get an object containing all unapproved transactions for the current
   * network. This is the only transaction fetching method that returns an
   * object, so it doesn't use getTransactions like everything else.
   *
   * @returns {Record<string, TransactionMeta>} Unapproved transactions keyed
   *  by id
   */
  getUnapprovedTxList() {
    return pickBy(
      this.store.getState().transactions,
      (transaction) =>
        transaction.status === TransactionStatus.unapproved &&
        !(
          transaction.exchangerType === ExchangerType.P2PExchanger &&
          transaction.pairType === ExchangePairType.cryptoCrypto
        ),
    );
  }

  /**
   * Get all approved transactions for the current network. If an address is
   * provided, the list will be further refined to only those transactions
   * originating from the supplied address.
   *
   * @param {string} [address] - hex prefixed address to find transactions for.
   * @returns {TransactionMeta[]} the filtered list of transactions
   */
  getApprovedTransactions(address) {
    const searchCriteria = { status: TransactionStatus.approved };
    if (address) {
      searchCriteria.from = address;
    }
    return this.getTransactions({ searchCriteria });
  }

  /**
   * Get all pending transactions for the current network. If an address is
   * provided, the list will be further refined to only those transactions
   * originating from the supplied address.
   *
   * @param {string} [address] - hex prefixed address to find transactions for.
   * @returns {TransactionMeta[]} the filtered list of transactions
   */
  getPendingTransactions(address) {
    const searchCriteria = { status: TransactionStatus.submitted };
    if (address) {
      searchCriteria.from = address;
    }
    const tsx = this.getTransactions({ searchCriteria });
    return tsx;
  }

  /**
   * Get all confirmed transactions for the current network. If an address is
   * provided, the list will be further refined to only those transactions
   * originating from the supplied address.
   *
   * @param {string} [address] - hex prefixed address to find transactions for.
   * @returns {TransactionMeta[]} the filtered list of transactions
   */
  getConfirmedTransactions(address) {
    const searchCriteria = { status: TransactionStatus.confirmed };
    if (address) {
      searchCriteria.from = address;
    }
    return this.getTransactions({ searchCriteria });
  }

  /**
   * Get all TransactionStatus.confirmed TransactionType.swap transactions for the current network. If an address is
   * provided, the list will be further refined to only those transactions
   * originating from the supplied address.
   *
   * @param {string} [address] - hex prefixed address to find transactions for.
   * @returns {TransactionMeta[]} the filtered list of transactions
   */
  getConfirmedSwapTransactions(address) {
    const searchCriteria = {
      status: TransactionStatus.confirmed,
      type: TransactionType.swap,
    };
    if (address) {
      searchCriteria.from = address;
    }
    return this.getTransactions({ searchCriteria });
  }

  /**
   * Get transaction with provided.
   *
   * @param {string} [actionId]
   * @returns {TransactionMeta} the filtered transaction
   */
  getTransactionWithActionId(actionId) {
    return values(
      pickBy(
        this.store.getState().transactions,
        (transaction) => transaction.actionId === actionId,
      ),
    )[0];
  }

  /**
   * Get p2p transaction with exchange id.
   *
   * @param {string} [exchangeId] - p2p exchange id
   * @returns {TransactionMeta} the filtered transaction
   */
  getTransactionWithExchangeId(exchangeId) {
    return values(this.store.getState().transactions).find(
      (tx) => tx.swapMetaData?.id === exchangeId,
    );
  }

  getAwaitingSwapTransactions() {
    return values(
      pickBy(
        this.store.getState().transactions,
        (transaction) =>
          [TransactionType.swap, TransactionType.atomicSwap].includes(
            transaction.type,
          ) && IN_PROGRESS_TRANSACTION_STATUSES.includes(transaction.status),
      ),
    );
  }

  /**
   * Adds the txMeta to the list of transactions in the store.
   * if the list is over txHistoryLimit it will remove a transaction that
   * is in its final state.
   * it will also add the key `history` to the txMeta with the snap shot of
   * the original object
   *
   * @param {TransactionMeta} txMeta - The TransactionMeta object to add.
   * @returns {TransactionMeta} The same TransactionMeta, but with validated
   *  txParams and transaction history.
   */
  addTransaction(txMeta) {
    // normalize and validate txParams if present
    if (txMeta.txParams) {
      txMeta.txParams = normalizeAndValidateTxParams(txMeta.txParams, false);
    }
    this.once(`${txMeta.id}:signed`, () => {
      this.removeAllListeners(`${txMeta.id}:rejected`);
    });
    this.once(`${txMeta.id}:rejected`, () => {
      this.removeAllListeners(`${txMeta.id}:signed`);
    });
    // initialize history
    txMeta.history = [];
    // capture initial snapshot of txMeta for history
    const snapshot = snapshotFromTxMeta(txMeta);
    txMeta.history.push(snapshot);

    const transactions = this.getTransactions({
      filterToCurrentNetwork: false,
    });
    const { txHistoryLimit } = this;

    // checks if the length of the tx history is longer then desired persistence
    // limit and then if it is removes the oldest confirmed or rejected tx.
    // Pending or unapproved transactions will not be removed by this
    // operation. For safety of presenting a fully functional transaction UI
    // representation, this function will not break apart transactions with the
    // same nonce, per network. Not accounting for transactions of the same
    // nonce and network combo can result in confusing or broken experiences
    // in the UI.
    //
    // TODO: we are already limiting what we send to the UI, and in the future
    // we will send UI only collected groups of transactions *per page* so at
    // some point in the future, this persistence limit can be adjusted. When
    // we do that I think we should figure out a better storage solution for
    // transaction history entries.
    const nonceNetworkSet = new Set();
    const txsToDelete = transactions
      .reverse()
      .filter((tx) => {
        const { nonce, from } = tx.txParams || {};
        const { chainId, metamaskNetworkId, status } = tx;
        const key = `${nonce}-${chainId ?? metamaskNetworkId}-${from}`;
        if (nonceNetworkSet.has(key)) {
          return false;
        } else if (
          nonceNetworkSet.size < txHistoryLimit - 1 ||
          getFinalStates().includes(status) === false
        ) {
          nonceNetworkSet.add(key);
          return false;
        }
        return true;
      })
      .map((tx) => tx.id);

    this._deleteTransactions(txsToDelete);
    this._addTransactionsToState([txMeta]);
    return txMeta;
  }

  addExternalTransaction(txMeta) {
    const fromAddress = txMeta?.txParams?.from;
    const confirmedTransactions = this.getConfirmedTransactions(fromAddress);
    const pendingTransactions = this.getPendingTransactions(fromAddress);
    validateConfirmedExternalTransaction({
      txMeta,
      pendingTransactions,
      confirmedTransactions,
    });
    this._addTransactionsToState([txMeta]);
    return txMeta;
  }

  /**
   * @param {number} txId
   * @returns {TransactionMeta} the txMeta who matches the given id if none found
   * for the network returns undefined
   */
  getTransaction(txId) {
    const { transactions } = this.store.getState();
    return transactions[txId];
  }

  /**
   * @param {string} exchangeId
   * @returns {TransactionMeta} the txMeta who matches the given id if none found
   * returns undefined
   */
  getTransactionByExchangeId(exchangeId) {
    const { transactions } = this.store.getState();
    return Object.values(transactions).find(
      ({ exchangerSettings }) => exchangerSettings?.exchangeId === exchangeId,
    );
  }

  /**
   * updates the txMeta in the list and adds a history entry
   *
   * @param {object} txMeta - the txMeta to update
   * @param {string} [note] - a note about the update for history
   */
  updateTransaction(txMeta, note) {
    // normalize and validate txParams if present
    if (txMeta.txParams) {
      try {
        txMeta.txParams = normalizeAndValidateTxParams(txMeta.txParams, false);
      } catch (error) {
        if (txMeta.warning.message === ERROR_SUBMITTING) {
          this.setTxStatusFailed(txMeta.id, error);
        } else {
          throw error;
        }

        return;
      }
    }

    this._updateTransactionHistory(txMeta, note);
  }

  _updateTransactionHistory(txMeta, note) {
    // create txMeta snapshot for history
    const currentState = snapshotFromTxMeta(txMeta);
    // recover previous tx state obj
    const previousState = replayHistory(txMeta.history);
    // generate history entry and add to history
    const entry = generateHistoryEntry(previousState, currentState, note);
    if (entry.length) {
      txMeta.history.push(entry);
    }

    // commit txMeta to state
    const txId = txMeta.id;
    this.store.updateState({
      transactions: {
        ...this.store.getState().transactions,
        [txId]: txMeta,
      },
    });
  }

  /**
   * SearchCriteria can search in any key in TxParams or the base
   * TransactionMeta. This type represents any key on either of those two
   * types.
   *
   * @typedef {TxParams[keyof TxParams] | TransactionMeta[keyof TransactionMeta]} SearchableKeys
   */

  /**
   * Predicates can either be strict values, which is shorthand for using
   * strict equality, or a method that receives he value of the specified key
   * and returns a boolean.
   *
   * @typedef {(v: unknown) => boolean | unknown} FilterPredicate
   */

  /**
   * Retrieve a list of transactions from state. By default this will return
   * the full list of Transactions for the currently selected chain/network.
   * Additional options can be provided to change what is included in the final
   * list.
   *
   * @param opts - options to change filter behavior
   * @param {Record<SearchableKeys, FilterPredicate>} [opts.searchCriteria] -
   *  an object with keys that match keys in TransactionMeta or TxParams, and
   *  values that are predicates. Predicates can either be strict values,
   *  which is shorthand for using strict equality, or a method that receives
   *  the value of the specified key and returns a boolean. The transaction
   *  list will be filtered to only those items that the predicate returns
   *  truthy for. **HINT**: `err: undefined` is like looking for a tx with no
   *  err. so you can also search txs that don't have something as well by
   *  setting the value as undefined.
   * @param {TransactionMeta[]} [opts.initialList] - If provided the filtering
   *  will occur on the provided list. By default this will be the full list
   *  from state sorted by time ASC.
   * @param {boolean} [opts.filterToCurrentNetwork] - Filter transaction
   *  list to only those that occurred on the current chain or network.
   *  Defaults to true.
   * @param {number} [opts.limit] - limit the number of transactions returned
   *  to N unique nonces.
   * @returns {TransactionMeta[]} The TransactionMeta objects that all provided
   *  predicates return truthy for.
   */
  getTransactions({ searchCriteria = {}, initialList, limit } = {}) {
    // const chainId = this.getCurrentChainId();
    // const network = this.getNetworkState();
    // searchCriteria is an object that might have values that aren't predicate
    // methods. When providing any other value type (string, number, etc), we
    // consider this shorthand for "check the value at key for strict equality
    // with the provided value". To conform this object to be only methods, we
    // mapValues (lodash) such that every value on the object is a method that
    // returns a boolean.
    const predicateMethods = mapValues(searchCriteria, (predicate) => {
      return typeof predicate === 'function'
        ? predicate
        : (v) => v === predicate;
    });

    // If an initial list is provided we need to change it back into an object
    // first, so that it matches the shape of our state. This is done by the
    // lodash keyBy method. This is the edge case for this method, typically
    // initialList will be undefined.
    const transactionsToFilter = initialList
      ? keyBy(initialList, 'id')
      : this.store.getState().transactions;

    // Combine sortBy and pickBy to transform our state object into an array of
    // matching transactions that are sorted by time.
    const filteredTransactions = sortBy(
      pickBy(transactionsToFilter, (transaction) => {
        // default matchesCriteria to the value of transactionMatchesNetwork
        // when filterToCurrentNetwork is true.

        // if (
        //   filterToCurrentNetwork &&
        //   transactionMatchesNetwork(transaction, chainId, network) === false
        // ) {
        //   return false;
        // }

        // iterate over the predicateMethods keys to check if the transaction
        // matches the searchCriteria
        for (const [key, predicate] of Object.entries(predicateMethods)) {
          // We return false early as soon as we know that one of the specified
          // search criteria do not match the transaction. This prevents
          // needlessly checking all criteria when we already know the criteria
          // are not fully satisfied. We check both txParams and the base
          // object as predicate keys can be either.
          if (key in (transaction.txParams || {})) {
            if (predicate(transaction.txParams[key]) === false) {
              return false;
            }
          } else if (predicate(transaction[key]) === false) {
            return false;
          }
        }

        return true;
      }),
      'time',
    );
    if (limit !== undefined) {
      // We need to have all transactions of a given nonce in order to display
      // necessary details in the UI. We use the size of this set to determine
      // whether we have reached the limit provided, thus ensuring that all
      // transactions of nonces we include will be sent to the UI.
      const nonces = new Set();
      const txs = [];
      // By default, the transaction list we filter from is sorted by time ASC.
      // To ensure that filtered results prefers the newest transactions we
      // iterate from right to left, inserting transactions into front of a new
      // array. The original order is preserved, but we ensure that newest txs
      // are preferred.
      for (let i = filteredTransactions.length - 1; i > -1; i--) {
        const txMeta = filteredTransactions[i];
        const { nonce } = txMeta.txParams || {};
        if (!nonces.has(nonce)) {
          if (nonces.size < limit) {
            nonces.add(nonce);
          } else {
            continue;
          }
        }
        // Push transaction into the beginning of our array to ensure the
        // original order is preserved.
        txs.unshift(txMeta);
      }
      return txs;
    }
    return filteredTransactions;
  }

  /**
   * Update status of the TransactionMeta with provided id to 'rejected'.
   * After setting the status, the TransactionMeta is deleted from state.
   *
   * TODO: Should we show historically rejected transactions somewhere in the
   * UI? Seems like it could be valuable for information purposes. Of course
   * only after limit issues are reduced.
   *
   * @param {number} txId - the target TransactionMeta's Id
   * @param deleteTx
   */
  setTxStatusRejected(txId, deleteTx = true) {
    this._setTransactionStatus(txId, TransactionStatus.rejected);
    if (deleteTx) {
      this._deleteTransaction(txId);
    }
  }

  /**
   * Update status of the TransactionMeta with provided id to 'unapproved'
   *
   * @param {number} txId - the target TransactionMeta's Id
   */
  setTxStatusUnapproved(txId) {
    this._setTransactionStatus(txId, TransactionStatus.unapproved);
  }

  /**
   * Update status of the TransactionMeta with provided id to 'approved'
   *
   * @param {number} txId - the target TransactionMeta's Id
   */
  setTxStatusApproved(txId) {
    this._setTransactionStatus(txId, TransactionStatus.approved);
  }

  /**
   * Update status of the TransactionMeta with provided id to 'signed'
   *
   * @param {number} txId - the target TransactionMeta's Id
   */
  setTxStatusSigned(txId) {
    this._setTransactionStatus(txId, TransactionStatus.signed);
  }

  /**
   * Update status of the TransactionMeta with provided id to 'submitted'
   * and sets the 'submittedTime' property with the current Unix epoch time.
   *
   * @param {number} txId - the target TransactionMeta's Id
   */
  setTxStatusSubmitted(txId) {
    const txMeta = this.getTransaction(txId);
    txMeta.submittedTime = new Date().getTime();
    this.updateTransaction(txMeta, 'txStateManager - add submitted time stamp');
    this._setTransactionStatus(txId, TransactionStatus.submitted);
  }

  /**
   * Update status of the TransactionMeta with provided id to 'confirmed'
   *
   * @param {number} txId - the target TransactionMeta's Id
   */
  setTxStatusConfirmed(txId) {
    this._setTransactionStatus(txId, TransactionStatus.confirmed);
  }

  /**
   * Update status of the TransactionMeta with provided id to 'dropped'
   *
   * @param {number} txId - the target TransactionMeta's Id
   */
  setTxStatusDropped(txId) {
    this._setTransactionStatus(txId, TransactionStatus.dropped);
  }

  /**
   * Update status of the TransactionMeta with provided id to 'failed' and put
   * the error on the TransactionMeta object.
   *
   * @param {number} txId - the target TransactionMeta's Id
   * @param {Error} err - error object
   */
  setTxStatusFailed(txId, err) {
    const error = err || new Error('Internal metamask failure');

    const txMeta = this.getTransaction(txId);
    txMeta.err = {
      message: error.message?.toString() || error.toString(),
      rpc: error.value,
      stack: error.stack,
    };
    this._updateTransactionHistory(
      txMeta,
      'transactions:tx-state-manager#fail - add error',
    );

    this._setTransactionStatus(txId, TransactionStatus.failed);
  }

  /**
   * Removes all transactions for the given address on the current network,
   * preferring chainId for comparison over networkId.
   *
   * @param {string} address - hex string of the from address on the txParams
   *  to remove
   */
  wipeTransactions(address) {
    // network only tx
    const { transactions } = this.store.getState();
    // const network = this.getNetworkState();
    // const chainId = this.getCurrentChainId();
    // Update state
    this.store.updateState({
      transactions: omitBy(
        transactions,
        (transaction) => transaction.walletAddress === address,
        // transactionMatchesNetwork(transaction, chainId, network),
      ),
    });
  }

  /**
   * Filters out the unapproved transactions from state
   */
  clearUnapprovedTxs() {
    this.store.updateState({
      transactions: omitBy(
        this.store.getState().transactions,
        (transaction) => transaction.status === TransactionStatus.unapproved,
      ),
    });
  }

  //
  //           PRIVATE METHODS
  //

  /**
   * Updates a transaction's status in state, and then emits events that are
   * subscribed to elsewhere. See below for best guesses on where and how these
   * events are received.
   *
   * @param {number} txId - the TransactionMeta Id
   * @param {TransactionStatusString} status - the status to set on the
   *  TransactionMeta
   * @fires txMeta.id:txMeta.status - every time a transaction's status changes
   *  we emit the change passing along the id. This does not appear to be used
   *  outside of this file, which only listens to this to unsubscribe listeners
   *  of :rejected and :signed statuses when the inverse status changes. Likely
   *  safe to drop.
   * @fires tx:status-update - every time a transaction's status changes we
   *  emit this event and pass txId and status. This event is subscribed to in
   *  the TransactionController and re-broadcast by the TransactionController.
   *  It is used internally within the TransactionController to try and update
   *  pending transactions on each new block (from blockTracker). It's also
   *  subscribed to in metamask-controller to display a browser notification on
   *  confirmed or failed transactions.
   * @fires txMeta.id:finished - When a transaction moves to a finished state
   *  this event is emitted, which is used in the TransactionController to pass
   *  along details of the transaction to the dapp that suggested them. This
   *  pattern is replicated across all of the message managers and can likely
   *  be supplemented or replaced by the ApprovalController.
   * @fires updateBadge - When the number of transactions changes in state,
   *  the badge in the browser extension bar should be updated to reflect the
   *  number of pending transactions. This particular emit doesn't appear to
   *  bubble up anywhere that is actually used. TransactionController emits
   *  this *anytime the state changes*, so this is probably superfluous.
   */
  _setTransactionStatus(txId, status) {
    const txMeta = this.getTransaction(txId);

    if (!txMeta) {
      return;
    }

    txMeta.status = status;
    try {
      this._updateTransactionHistory(
        txMeta,
        `txStateManager: setting status to ${status}`,
      );
      this.emit(`${txMeta.id}:${status}`, txId);
      this.emit(`tx:status-update`, txId, status);
      if (
        [
          TransactionStatus.submitted,
          TransactionStatus.rejected,
          TransactionStatus.failed,
        ].includes(status)
      ) {
        this.emit(`${txMeta.id}:finished`, txMeta);
      }
      this.emit(METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE);
    } catch (error) {
      log.error(error);
    }
  }

  /**
   * Adds one or more transactions into state. This is not intended for
   * external use.
   *
   * @private
   * @param {TransactionMeta[]} transactions - the list of transactions to save
   */
  _addTransactionsToState(transactions) {
    this.store.updateState({
      transactions: transactions.reduce((result, newTx) => {
        result[newTx.id] = newTx;
        return result;
      }, this.store.getState().transactions),
    });
  }

  /**
   * removes one transaction from state. This is not intended for external use.
   *
   * @private
   * @param {number} targetTransactionId - the transaction to delete
   */
  _deleteTransaction(targetTransactionId) {
    const { transactions } = this.store.getState();
    delete transactions[targetTransactionId];
    this.store.updateState({
      transactions,
    });
  }

  /**
   * removes multiple transaction from state. This is not intended for external use.
   *
   * @private
   * @param {number[]} targetTransactionIds - the transactions to delete
   */
  _deleteTransactions(targetTransactionIds) {
    const { transactions } = this.store.getState();
    targetTransactionIds.forEach((transactionId) => {
      delete transactions[transactionId];
    });
    this.store.updateState({
      transactions,
    });
  }
}
