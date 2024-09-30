import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';

import { clearConfirmTransaction } from '../../ducks/confirm-transaction/confirm-transaction.duck';

import {
  updateCustomNonce,
  cancelTx,
  cancelTxs,
  updateAndApproveTx,
  showModal,
  getNextNonce,
  setDefaultHomeActiveTabName,
  addToAddressBook,
} from '../../store/actions';
import { isBalanceSufficient } from '../send/send.utils';
import { shortenAddress, valuesFor } from '../../helpers/utils/util';
import {
  getAdvancedInlineGasShown,
  getCustomNonceValue,
  getIsMainnet,
  getKnownMethodData,
  getUseNonceField,
  transactionFeeSelector,
  getNoGasPriceFetched,
  getIsEthGasPriceFetched,
  getShouldShowFiat,
  getPreferences,
  doesAddressRequireLedgerHidConnection,
  getTokenList,
  getIsMultiLayerFeeNetwork,
  getIsBuyableChain,
  getEnsResolutionByAddress,
  getUnapprovedTransaction,
  getFullTxData,
  getUseCurrencyRateCheck,
  getSelectedAccount,
  getAddressBookEntryOrAccountName,
  assetModel,
} from '../../selectors';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import {
  isAddressLedger,
  updateGasFees,
  getSendToAccounts,
} from '../../ducks/metamask/metamask';
import { addHexPrefix } from '../../../app/scripts/lib/util';

import {
  parseStandardTokenTransactionData,
  txParamsAreDappSuggested,
} from '../../../shared/modules/transaction.utils';
import { toChecksumHexAddress } from '../../../shared/modules/hexstring-utils';

import { getGasLoadingAnimationIsShowing } from '../../ducks/app/app';
import { isLegacyTransaction } from '../../helpers/utils/transactions.util';
import { CUSTOM_GAS_ESTIMATE } from '../../../shared/constants/gas';
import {
  TransactionStatus,
  TransactionType,
} from '../../../shared/constants/transaction';
import { isEqualCaseInsensitive } from '../../../shared/modules/string-utils';
import { getTokenAddressParam } from '../../helpers/utils/token-util';
import { calcGasTotal } from '../../../shared/lib/transactions-controller-utils';
import ConfirmTransactionBase from './confirm-transaction-base.component';

let customNonceValue = '';
const customNonceMerge = (txData) =>
  customNonceValue
    ? {
        ...txData,
        customNonceValue,
      }
    : txData;

function addressIsNew(toAccounts, newAddress) {
  const newAddressNormalized = newAddress.toLowerCase();
  const foundMatching = toAccounts.some(
    ({ address }) => address.toLowerCase() === newAddressNormalized,
  );
  return !foundMatching;
}

const mapStateToProps = (state, ownProps) => {
  const {
    toAddress: propsToAddress,
    customTxParamsData,
    match: { params = {} },
    transaction: { id: propsTransactionId } = {},
  } = ownProps;
  const { id: pathTransactionId } = params;
  const paramsTransactionId = propsTransactionId || pathTransactionId;
  const isMainnet = getIsMainnet(state);

  // const isGasEstimatesLoading = getIsGasEstimatesLoading(state);
  const gasLoadingAnimationIsShowing = getGasLoadingAnimationIsShowing(state);
  const isBuyableChain = getIsBuyableChain(state);
  const { confirmTransaction, metamask } = state;
  const {
    conversionRate,
    identities,
    addressBook,
    unapprovedTxs,
    nextNonce,
    allNftContracts,
    selectedAddress,
  } = metamask;
  const { tokenData, txData, tokenProps, nonce } = confirmTransaction;

  const {
    txParams = {},
    id: transactionId,
    type,
    destination,
    source,
    exchangerType,
  } = txData;
  const txId =
    transactionId || (paramsTransactionId && Number(paramsTransactionId));
  const transaction = getUnapprovedTransaction(state, txId);
  const {
    from: fromAddress,
    to: txParamsToAddress,
    gasPrice,
    gas: gasLimit,
    value: amount,
    localId,
    data,
  } = transaction?.txParams ?? txParams;

  let sendEntity = localId;

  if (type === TransactionType.swap) {
    sendEntity = source;
  }

  const assetInstance = assetModel(state, sendEntity);

  const transactionData = parseStandardTokenTransactionData(data);
  const tokenToAddress = getTokenAddressParam(transactionData);
  const { address } = getSelectedAccount(state);
  const fromName = getAddressBookEntryOrAccountName(state, address);

  let toAddress = txParamsToAddress;
  if (type !== TransactionType.simpleSend) {
    toAddress = propsToAddress || tokenToAddress || txParamsToAddress;
  }

  const toAccounts = getSendToAccounts(state);

  const tokenList = getTokenList(state);

  const toName =
    identities[toAddress]?.name ||
    tokenList[toAddress?.toLowerCase()]?.name ||
    shortenAddress(toChecksumHexAddress(toAddress));

  const transactionStatus = transaction ? transaction.status : '';
  const supportsEIP1559 = true && !isLegacyTransaction(txParams);

  const {
    hexTransactionAmount,
    hexMinimumTransactionFee,
    hexMaximumTransactionFee,
    hexTransactionTotal,
    gasEstimationObject,
    bandwidth,
    energy,
  } = transactionFeeSelector(state, transaction);

  const currentNetworkUnapprovedTxs = Object.keys(unapprovedTxs)
    // .filter((key) =>
    //   transactionMatchesNetwork(unapprovedTxs[key], chainId, network),
    // )
    .reduce((acc, key) => ({ ...acc, [key]: unapprovedTxs[key] }), {});
  const unapprovedTxCount = valuesFor(currentNetworkUnapprovedTxs).length;

  const methodData = getKnownMethodData(state, data) || {};

  const fullTxData = getFullTxData(
    state,
    txId,
    TransactionStatus.unapproved,
    customTxParamsData,
  );

  customNonceValue = getCustomNonceValue(state);
  const isEthGasPrice = getIsEthGasPriceFetched(state);
  const noGasPrice = !supportsEIP1559 && getNoGasPriceFetched(state);
  const { useNativeCurrencyAsPrimaryCurrency } = getPreferences(state);
  const gasFeeIsCustom =
    fullTxData.userFeeLevel === CUSTOM_GAS_ESTIMATE ||
    txParamsAreDappSuggested(fullTxData);
  const fromAddressIsLedger = isAddressLedger(state, fromAddress);

  const hardwareWalletRequiresConnection =
    doesAddressRequireLedgerHidConnection(state, fromAddress);

  const isMultiLayerFeeNetwork = getIsMultiLayerFeeNetwork(state);

  return {
    fromAddress,
    fromName,
    toAccounts,
    toAddress,
    toName,
    hexTransactionAmount,
    hexMinimumTransactionFee,
    hexMaximumTransactionFee,
    hexTransactionTotal,
    bandwidth,
    energy,
    txData: fullTxData,
    tokenData,
    methodData,
    tokenProps,
    conversionRate,
    transactionStatus,
    nonce,
    unapprovedTxs,
    unapprovedTxCount,
    customGas: {
      gasLimit,
      gasPrice,
    },
    advancedInlineGasShown: getAdvancedInlineGasShown(state),
    useNonceField: getUseNonceField(state),
    customNonceValue,
    hideFiatConversion: !getShouldShowFiat(state),
    type,
    nextNonce,
    mostRecentOverviewPage: getMostRecentOverviewPage(state),
    isMainnet,
    isEthGasPrice,
    noGasPrice,
    supportsEIP1559,
    gasIsLoading: gasLoadingAnimationIsShowing,
    useNativeCurrencyAsPrimaryCurrency,
    maxFeePerGas: gasEstimationObject.maxFeePerGas,
    maxPriorityFeePerGas: gasEstimationObject.maxPriorityFeePerGas,
    baseFeePerGas: gasEstimationObject.baseFeePerGas,
    gasFeeIsCustom,
    showLedgerSteps: fromAddressIsLedger,
    hardwareWalletRequiresConnection,
    isMultiLayerFeeNetwork,
    isBuyableChain,
    useCurrencyRateCheck: getUseCurrencyRateCheck(state),
    destination,
    source,
    exchangerType,
    localId,
    addressBook,
    amount,
    allNftContracts,
    selectedAddress,
    assetInstance,
    state,
  };
};

export const mapDispatchToProps = (dispatch, state) => {
  const { callbackSubmit } = state;
  return {
    tryReverseResolveAddress: (address) => {
      return address;
      // Ens disabled in dextrade
      // return dispatch(tryReverseResolveAddress(address));
    },
    updateCustomNonce: (value) => {
      customNonceValue = value;
      dispatch(updateCustomNonce(value));
    },
    clearConfirmTransaction: () => dispatch(clearConfirmTransaction()),
    showTransactionConfirmedModal: ({ onSubmit }) => {
      return dispatch(showModal({ name: 'TRANSACTION_CONFIRMED', onSubmit }));
    },
    showRejectTransactionsConfirmationModal: ({
      onSubmit,
      unapprovedTxCount,
    }) => {
      return dispatch(
        showModal({ name: 'REJECT_TRANSACTIONS', onSubmit, unapprovedTxCount }),
      );
    },
    cancelTransaction: ({ id }) => dispatch(cancelTx({ id })),
    cancelAllTransactions: (txList) => dispatch(cancelTxs(txList)),
    sendTransaction: (txData) =>
      dispatch(
        updateAndApproveTx(customNonceMerge(txData), false, !callbackSubmit),
      ),
    getNextNonce: () => dispatch(getNextNonce()),
    setDefaultHomeActiveTabName: (tabName) =>
      dispatch(setDefaultHomeActiveTabName(tabName)),
    updateTransactionGasFees: (gasFees) => {
      dispatch(updateGasFees({ ...gasFees, expectHexWei: true }));
    },
    showBuyModal: () => dispatch(showModal({ name: 'DEPOSIT_ETHER' })),
    addToAddressBookIfNew: (newAddress, toAccounts, nickname = '') => {
      const hexPrefixedAddress = addHexPrefix(newAddress);
      if (addressIsNew(toAccounts, hexPrefixedAddress)) {
        dispatch(addToAddressBook(hexPrefixedAddress, nickname));
      }
    },
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {
    txData,
    unapprovedTxs,
    toAddress,
    addressBook,
    customGas: { gasLimit, gasPrice },
    amount,
    conversionRate,
    fullTxData,
    selectedAddress,
    allNftContracts,
    state,
    assetInstance,
  } = stateProps;

  const checksummedAddress = toChecksumHexAddress(toAddress);
  const addressBookObject =
    addressBook &&
    addressBook[assetInstance.chainId] &&
    addressBook[assetInstance.chainId][checksummedAddress];
  const toEns = getEnsResolutionByAddress(state, checksummedAddress);
  const toNickname = addressBookObject ? addressBookObject.name : '';

  const insufficientBalance = !isBalanceSufficient({
    amount,
    gasTotal: calcGasTotal(gasLimit, gasPrice),
    balance: assetInstance.balance,
    conversionRate,
  });

  const isNftTransfer = Boolean(
    allNftContracts?.[selectedAddress]?.[assetInstance.chainId]?.find(
      (contract) => {
        return isEqualCaseInsensitive(contract.address, fullTxData.txParams.to);
      },
    ),
  );

  const {
    cancelAllTransactions: dispatchCancelAllTransactions,
    updateTransactionGasFees: dispatchUpdateTransactionGasFees,
    ...otherDispatchProps
  } = dispatchProps;

  return {
    ...stateProps,
    ...otherDispatchProps,
    ...ownProps,
    toEns,
    toNickname,
    insufficientBalance,
    hideSubtitle: !getShouldShowFiat(state) && !isNftTransfer,
    assetInstance,
    cancelAllTransactions: () =>
      dispatchCancelAllTransactions(valuesFor(unapprovedTxs)),
    updateGasAndCalculate: (v) => {
      dispatchUpdateTransactionGasFees({
        gasLimit: v.gasLimit,
        gasPrice: v.gasPrice,
        transaction: txData,
      });
    },
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps, mergeProps),
)(ConfirmTransactionBase);
