import PropTypes from 'prop-types';
import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { TransactionType } from '../../../../../shared/constants/transaction';
import { calcTokenAmount } from '../../../../../shared/lib/transactions-controller-utils';
import {
  clearConfirmTransaction,
  setTransactionToConfirm,
} from '../../../../ducks/confirm-transaction/confirm-transaction.duck';
import { setDEXExchangesLoading } from '../../../../ducks/swaps/swaps';
import { useAsset } from '../../../../hooks/useAsset';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { usePrevious } from '../../../../hooks/usePrevious';
import ConfirmApprove from '../../../../pages/confirm-approve';
import ConfirmContractInteraction from '../../../../pages/confirm-contract-interaction';
import ConfirmTokenTransactionBase from '../../../../pages/confirm-token-transaction-base';
import {
  assetModel,
  getUnapprovedTransactions,
  transactionFeeSelector,
  unconfirmedTransactionsHashSelector,
  unconfirmedTransactionsListSelector,
} from '../../../../selectors';
import {
  addPollingTokenToAppState,
  disconnectGasFeeEstimatePoller,
  getGasFeeEstimatesAndStartPolling,
  removePollingTokenFromAppState,
} from '../../../../store/actions';

const ConfirmTokenTransaction = (props) => {
  const { hideModal, txId, onSubmit, onSubmitError, onCancel, onCancelError } =
    props;
  const t = useI18nContext();
  const dispatch = useDispatch();
  // TODO: check deprecated useAsset;
  const AssetModelHook = useAsset();
  const unapprovedTxs = useSelector(getUnapprovedTransactions);
  const unconfirmedTxs = useSelector(unconfirmedTransactionsListSelector);
  const unconfirmedMessages = useSelector(unconfirmedTransactionsHashSelector);

  const getTransaction = useCallback(() => {
    if (
      unconfirmedTxs?.length &&
      (unconfirmedTxs[0].actionId === txId || unconfirmedTxs[0].id === txId)
    ) {
      return unconfirmedTxs[0];
    }
    return Object.values(unapprovedTxs)
      .concat(Object.values(unconfirmedMessages))
      .concat(unconfirmedTxs)
      .find((tx) => tx.id === txId || tx.actionId === txId);
  }, [txId, unapprovedTxs, unconfirmedTxs, unconfirmedMessages]);

  const [transaction, setTransaction] = useState(getTransaction);
  // console.log('transaction', transaction);

  const {
    ethTransactionTotal,
    fiatTransactionTotal,
    hexTransactionTotal,
    hexMaximumTransactionFee,
  } = useSelector((state) => transactionFeeSelector(state, transaction || {}));
  const asset = useSelector((state) =>
    assetModel(state, transaction.txParams?.localId),
  );

  const content = useMemo(() => {
    if (!transaction) {
      return <span>no transaction available</span>;
    }
    const { type, txParams = {} } = transaction;
    const { data, localId, to: tokenAddress, from: userAddress } = txParams;
    if (!localId) {
      return <span>no localId</span>;
    }

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

    console.log('asset.sharedProvider', asset.sharedProvider);
    console.log(
      'asset.sharedProvider',
      asset.sharedProvider?.parseTokenTransferData?.(data),
    );
    return;

    const {
      toAddress,
      tokenAmount: tokenAmountString,
      tokenId,
    } = asset.sharedProvider.parseTokenTransferData(data);

    const tokenAmount = tokenAmountString
      ? calcTokenAmount(tokenAmountString, assetDecimals)
      : null;

    switch (type) {
      case TransactionType.tokenMethodApprove:
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
            // isSwapApprove={source && destination}
            callbackSubmit={onSubmit}
            callbackSubmitError={onSubmitError}
            callbackCancel={onCancel}
            callbackCancelError={onCancelError}
          />
        );
      default:
        return <span>Default render content</span>;
    }
  }, [
    transaction,
    AssetModelHook,
    ethTransactionTotal,
    fiatTransactionTotal,
    hexTransactionTotal,
    onSubmit,
    onSubmitError,
    onCancel,
    onCancelError,
  ]);

  const closeModal = useCallback(() => {
    dispatch(setDEXExchangesLoading(false));
    hideModal();
  }, [dispatch, hideModal]);

  useEffect(() => {
    if (!txId) {
      closeModal();
    }
  }, [txId, closeModal]);

  useEffect(() => {
    dispatch(clearConfirmTransaction());
    const tx = getTransaction();
    setTransaction(tx);
    if (tx?.id) {
      dispatch(setTransactionToConfirm(tx.id));
    }

    //
    // if (tx?.txParams) {
    //   const asset = new AssetModelHook(tx.txParams.localId);
    //   getGasFeeEstimatesAndStartPolling(asset.chainId).then((_pollingToken) => {
    //     addPollingTokenToAppState(_pollingToken);
    //   });
    // }
  }, [AssetModelHook, dispatch, getTransaction]);

  return <>{content}</>;
};

ConfirmTokenTransaction.contextTypes = {
  t: PropTypes.func,
};

ConfirmTokenTransaction.propTypes = {
  hideModal: PropTypes.func.isRequired,
  txId: PropTypes.number,
  onSubmit: PropTypes.func,
  onSubmitError: PropTypes.func,
  onCancel: PropTypes.func,
  onCancelError: PropTypes.func,
};

export default ConfirmTokenTransaction;
