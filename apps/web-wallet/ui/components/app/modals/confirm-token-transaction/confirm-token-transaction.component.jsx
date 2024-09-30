import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  TransactionStatus,
  TransactionType,
} from '../../../../../shared/constants/transaction';
import { calcTokenAmount } from '../../../../../shared/lib/transactions-controller-utils';
import { setTransactionToConfirm } from '../../../../ducks/confirm-transaction/confirm-transaction.duck';
import { getSwapsErrorKey } from '../../../../ducks/swaps/swaps';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import ConfirmApprove from '../../../../pages/confirm-approve';
import ConfirmContractInteraction from '../../../../pages/confirm-contract-interaction';
import ConfirmTransaction from '../../../../pages/confirm-transaction';
import AwaitingSwap from '../../../../pages/swaps/awaiting-swap';
import {
  assetModel,
  currentNetworkTxListSelector,
  transactionFeeSelector,
} from '../../../../selectors';

const ConfirmTokenTransactionSwitcher = ({ transaction, ...restProps }) => {
  // TODO: check ui/pages/confirm-transaction/confirm-token-transaction-switch.jsx
  const { txParams = {}, source, destination } = transaction;
  const { data, localId, to: tokenAddress, from: userAddress } = txParams;

  const asset = useSelector((state) => assetModel(state, localId));

  const {
    standard: assetStandard,
    name: assetName,
    symbol: assetSymbol,
    decimals: assetDecimals,
  } = asset;

  const userBalance = asset.balance;
  const assetImage = asset.getIconUrl();
  const { nativeToken } = asset.sharedProvider;
  const nativeDecimals = nativeToken.decimals;
  const nativeCurrency = nativeToken.symbol;

  const {
    ethTransactionTotal,
    fiatTransactionTotal,
    hexTransactionTotal,
    hexMaximumTransactionFee,
  } = useSelector((state) => transactionFeeSelector(state, transaction || {}));

  const {
    toAddress,
    tokenAmount: tokenAmountString,
    tokenId,
  } = asset.sharedProvider.parseTokenTransferData(data);

  const tokenAmount = tokenAmountString
    ? calcTokenAmount(tokenAmountString, assetDecimals)
    : null;

  return (
    <ConfirmApprove
      assetStandard={assetStandard}
      assetName={assetName}
      userBalance={userBalance}
      tokenSymbol={assetSymbol}
      decimals={assetDecimals}
      tokenImage={assetImage}
      tokenAmount={tokenAmount}
      tokenId={tokenId}
      userAddress={userAddress}
      tokenAddress={tokenAddress}
      toAddress={toAddress}
      transaction={transaction}
      ethTransactionTotal={ethTransactionTotal}
      fiatTransactionTotal={fiatTransactionTotal}
      hexTransactionTotal={hexTransactionTotal}
      nativeCurrency={nativeCurrency}
      nativeDecimals={nativeDecimals}
      isSwapApprove={source && destination}
      {...restProps}
    />
  );
};

const ConfirmTokenTransaction = (props) => {
  const {
    hideModal,
    txId,
    onSubmit,
    onSubmitError,
    onCancel,
    onCancelError,
    onSwapNew,
    onModalConfirm,
  } = props;

  const t = useI18nContext();
  const dispatch = useDispatch();
  const swapsErrorKey = useSelector(getSwapsErrorKey);
  const txList = useSelector(currentNetworkTxListSelector, shallowEqual);

  const renderContent = useCallback(
    (params) => {
      const { transaction } = params;
      if (!transaction || !Object.keys(transaction).length) {
        return <span>No transaction!</span>;
      }

      const { txParams: { data } = {}, type } = transaction;
      if (!data) {
        return <span>No data in transaction txParams </span>;
      }

      switch (type) {
        case TransactionType.tokenMethodApprove:
          return (
            <ConfirmTokenTransactionSwitcher
              hideNavigation
              transaction={transaction}
              callbackSubmit={onSubmit}
              callbackSubmitError={onSubmitError}
              callbackCancel={onCancel}
              callbackCancelError={onCancelError}
            />
          );
        default:
          return (
            <ConfirmContractInteraction
              hideNavigation
              transaction={transaction}
              callbackSubmit={onSubmit}
              callbackSubmitError={onSubmitError}
              callbackCancel={onCancel}
              callbackCancelError={onCancelError}
            />
          );
      }
    },
    [onCancel, onCancelError, onSubmit, onSubmitError],
  );

  const renderFallback = useCallback(
    (params) => {
      const tx = txId && txList.find(({ id }) => txId === id);
      if (!tx) {
        return null;
      }
      const confirmedTx = [
        TransactionStatus.confirmed,
        TransactionStatus.rejected,
        TransactionStatus.failed,
      ].includes(tx.status);
      return (
        <AwaitingSwap
          hideFooter={tx?.type === TransactionType.swapApproval}
          transaction={tx}
          swapComplete={tx?.status === TransactionStatus.confirmed}
          submittingSwap={tx && !confirmedTx}
          onSwapNew={() => {
            hideModal?.();
            onSwapNew?.();
          }}
          onSubmit={() => {
            hideModal?.();
            onModalConfirm?.();
          }}
        />
      );
    },
    [txId, txList, hideModal, onSwapNew, onModalConfirm],
  );

  useEffect(() => {
    if (!txId) {
      hideModal();
    }
    if (txId) {
      dispatch(setTransactionToConfirm(txId));
    }
  }, [txId, hideModal, dispatch]);

  return (
    <div className="confirm-transaction-modal">
      <ConfirmTransaction transactionId={txId}>
        {(params) => {
          const { transaction } = params;
          return !transaction || !Object.keys(transaction).length
            ? renderFallback(params)
            : renderContent(params);
        }}
      </ConfirmTransaction>
    </div>
  );
};

ConfirmTokenTransaction.contextTypes = {
  t: PropTypes.func,
};

ConfirmTokenTransactionSwitcher.propTypes = {
  transaction: PropTypes.object.isRequired,
};

ConfirmTokenTransaction.propTypes = {
  hideModal: PropTypes.func.isRequired,
  txId: PropTypes.number,
  onSubmit: PropTypes.func,
  onSubmitError: PropTypes.func,
  onCancel: PropTypes.func,
  onCancelError: PropTypes.func,
  onSwapNew: PropTypes.func,
  onModalConfirm: PropTypes.func,
};

export default ConfirmTokenTransaction;
