import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useHistory, useParams } from 'react-router-dom';

import Loading from '../../components/ui/loading-screen';
import ConfirmContractInteraction from '../confirm-contract-interaction';
import ConfirmDeployContract from '../confirm-deploy-contract';
import ConfirmDecryptMessage from '../confirm-decrypt-message';
import ConfirmEncryptionPublicKey from '../confirm-encryption-public-key';
import ConfirmSendEther from '../confirm-send-ether';
import ConfirmTransactionSwitch from '../confirm-transaction-switch';

import { ORIGIN_METAMASK } from '../../../shared/constants/app';

import {
  clearConfirmTransaction,
  setTransactionToConfirm,
} from '../../ducks/confirm-transaction/confirm-transaction.duck';
import { getMostRecentOverviewPage } from '../../ducks/history/history';
import { getSendTo } from '../../ducks/send';
import {
  CONFIRM_APPROVE_P2P_PATH,
  CONFIRM_DEPLOY_CONTRACT_PATH,
  CONFIRM_SEND_ETHER_PATH,
  CONFIRM_TOKEN_METHOD_PATH,
  CONFIRM_TRANSACTION_ROUTE,
  DECRYPT_MESSAGE_REQUEST_PATH,
  DEFAULT_ROUTE,
  ENCRYPTION_PUBLIC_KEY_REQUEST_PATH,
  SIGNATURE_REQUEST_PATH,
} from '../../helpers/constants/routes';
import { isTokenMethodAction } from '../../helpers/utils/transactions.util';
import { usePrevious } from '../../hooks/usePrevious';
import {
  getUnapprovedTransactions,
  unconfirmedTransactionsListSelector,
  unconfirmedTransactionsHashSelector,
  assetModel,
} from '../../selectors';
import {
  addPollingTokenToAppState,
  disconnectGasFeeEstimatePoller,
  getContractMethodData,
  getGasFeeEstimatesAndStartPolling,
  removePollingTokenFromAppState,
  setDefaultHomeActiveTabName,
} from '../../store/actions';
import ConfirmSignatureRequest from '../confirm-signature-request';
import ConfirmP2P from '../confirm-p2p';
import ConfirmTokenTransactionSwitch from './confirm-token-transaction-switch';

const ConfirmTransaction = ({
  transactionId: propsTransactionId,
  children,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id: pathTransactionId } = useParams();
  const paramsTransactionId = propsTransactionId || pathTransactionId;

  const [isMounted, setIsMounted] = useState(false);
  const [pollingToken, setPollingToken] = useState();

  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);
  const sendTo = useSelector(getSendTo);
  const unapprovedTxs = useSelector(getUnapprovedTransactions);
  const unconfirmedTxs = useSelector(unconfirmedTransactionsListSelector);
  const unconfirmedMessages = useSelector(unconfirmedTransactionsHashSelector);

  const totalUnapproved = unconfirmedTxs.length || 0;
  const getTransaction = useCallback(() => {
    return totalUnapproved
      ? unapprovedTxs[paramsTransactionId] ||
          unconfirmedMessages[paramsTransactionId] ||
          unconfirmedTxs[0]
      : {};
  }, [
    paramsTransactionId,
    totalUnapproved,
    unapprovedTxs,
    unconfirmedMessages,
    unconfirmedTxs,
  ]);
  const [transaction, setTransaction] = useState(getTransaction);

  useEffect(() => {
    const tx = getTransaction();
    setTransaction(tx);
    if (tx?.id) {
      dispatch(setTransactionToConfirm(tx.id));
    }
  }, [
    dispatch,
    getTransaction,
    paramsTransactionId,
    totalUnapproved,
    unapprovedTxs,
    unconfirmedMessages,
    unconfirmedTxs,
  ]);

  const { id, type } = transaction;
  const transactionId = id && String(id);
  const isValidTokenMethod = isTokenMethodAction(type);
  const isValidTransactionId =
    transactionId &&
    (!paramsTransactionId || paramsTransactionId === transactionId);

  const prevParamsTransactionId = usePrevious(paramsTransactionId);
  const prevTransactionId = usePrevious(transactionId);

  const _beforeUnload = useCallback(() => {
    setIsMounted(false);

    if (pollingToken) {
      disconnectGasFeeEstimatePoller(pollingToken);
      removePollingTokenFromAppState(pollingToken);
    }
  }, [pollingToken]);

  useEffect(() => {
    setIsMounted(true);
    const tx = getTransaction();
    if (tx.chainId) {
      getGasFeeEstimatesAndStartPolling(tx.chainId).then((_pollingToken) => {
        if (isMounted) {
          setPollingToken(_pollingToken);
          addPollingTokenToAppState(_pollingToken);
        } else {
          disconnectGasFeeEstimatePoller(_pollingToken);
          removePollingTokenFromAppState(_pollingToken);
        }
      });
    }

    window.addEventListener('beforeunload', _beforeUnload);

    if (!totalUnapproved && !sendTo && !children) {
      history.replace(mostRecentOverviewPage);
    } else {
      const { txParams: { data } = {}, origin } = transaction;

      if (origin !== ORIGIN_METAMASK) {
        dispatch(getContractMethodData(data));
      }

      const txId = transactionId || paramsTransactionId;
      if (txId) {
        dispatch(setTransactionToConfirm(txId));
      }
    }

    return () => {
      _beforeUnload();
      window.removeEventListener('beforeunload', _beforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      paramsTransactionId &&
      transactionId &&
      prevParamsTransactionId !== paramsTransactionId
    ) {
      const { txData: { txParams: { data } = {}, origin } = {} } = transaction;

      dispatch(clearConfirmTransaction());
      dispatch(setTransactionToConfirm(paramsTransactionId));
      if (origin !== ORIGIN_METAMASK) {
        dispatch(getContractMethodData(data));
      }
    } else if (
      prevTransactionId &&
      !transactionId &&
      !totalUnapproved &&
      !children
    ) {
      dispatch(setDefaultHomeActiveTabName('activity')).then(() => {
        history.replace(DEFAULT_ROUTE);
      });
    } else if (
      prevTransactionId &&
      transactionId &&
      prevTransactionId !== transactionId &&
      paramsTransactionId !== transactionId
    ) {
      history.replace(mostRecentOverviewPage);
    }
  }, [
    dispatch,
    history,
    mostRecentOverviewPage,
    paramsTransactionId,
    prevParamsTransactionId,
    prevTransactionId,
    totalUnapproved,
    transaction,
    transactionId,
  ]);

  if (children) {
    if (!transaction) {
      return null;
    }
    return typeof children === 'function'
      ? children({
          isValidTransactionId,
          transaction,
          isValidTokenMethod,
          totalUnapproved,
          txId: paramsTransactionId,
          mostRecentOverviewPage,
          sendTo,
          unapprovedTxs,
          unconfirmedTxs,
          unconfirmedMessages,
        })
      : children;
  }

  if (isValidTokenMethod && isValidTransactionId) {
    return <ConfirmTokenTransactionSwitch transaction={transaction} />;
  }

  // Show routes when state.confirmTransaction has been set and when either the ID in the params
  // isn't specified or is specified and matches the ID in state.confirmTransaction in order to
  // support URLs of /confirm-transaction or /confirm-transaction/<transactionId>
  return isValidTransactionId ? (
    <Switch>
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${CONFIRM_DEPLOY_CONTRACT_PATH}`}
        component={ConfirmDeployContract}
      />
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${CONFIRM_APPROVE_P2P_PATH}`}
        component={ConfirmP2P}
      />
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${CONFIRM_SEND_ETHER_PATH}`}
        component={ConfirmSendEther}
      />
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${CONFIRM_TOKEN_METHOD_PATH}`}
        component={ConfirmContractInteraction}
      />
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${SIGNATURE_REQUEST_PATH}`}
        component={ConfirmSignatureRequest}
      />
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${DECRYPT_MESSAGE_REQUEST_PATH}`}
        component={ConfirmDecryptMessage}
      />
      <Route
        exact
        path={`${CONFIRM_TRANSACTION_ROUTE}/:id?${ENCRYPTION_PUBLIC_KEY_REQUEST_PATH}`}
        component={ConfirmEncryptionPublicKey}
      />
      <Route path="*" component={ConfirmTransactionSwitch} />
    </Switch>
  ) : (
    <Loading />
  );
};

ConfirmTransaction.propTypes = {
  transactionId: PropTypes.number,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
};

export default ConfirmTransaction;
