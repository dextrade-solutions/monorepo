import { isEqual } from 'lodash';
import React, { memo, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MINUTE } from '../../../../shared/constants/time';
import { TransactionStatus } from '../../../../shared/constants/transaction';
import { setRedirectOverviewPage } from '../../../ducks/history/history';
import {
  getBalanceError,
  getDEXRates,
  getFromToken,
  getFromTokenError,
  getFromTokenInputValue,
  getSwapsErrorKey,
  getToToken,
  getTransactionById,
  setDEXExchangesLoading,
  signAndSendTransactions,
} from '../../../ducks/swaps/swaps';
import { AWAITING_SWAP_ROUTE, DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import { useCurrentTokens } from '../../../hooks/useCurrentTokens';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { hideModal, showModal } from '../../../store/actions';
import SwapsFooter from '../swaps-footer';

const DexExchangeFooter = (props) => {
  const { provider, errors, loading, customApproveValue } = props;
  const { hasApproval, provider: providerName } = provider;
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  const swapsErrorKey = useSelector(getSwapsErrorKey);
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const fromInputValue = useSelector(getFromTokenInputValue);
  const fromTokenError = useSelector(getFromTokenError);
  const balanceError = useSelector(getBalanceError);
  const { findToken } = useCurrentTokens();

  const normalizeCoin = useCallback(
    (token, amount) => {
      if (!token) {
        return {};
      }
      const findedToken = findToken(token?.symbol, token?.network);
      if (!findedToken) {
        return token;
      }
      return {
        asset: {
          ...findedToken,
          account: findedToken?.account || findedToken?.getAccount(),
          contract: findedToken.contract,
          chainId: findedToken.chainId,
        },
        amount,
      };
    },
    [findToken],
  );

  const from = useMemo(
    () => normalizeCoin(fromToken, fromInputValue),
    [fromToken, fromInputValue, normalizeCoin],
  );
  const to = useMemo(
    () => normalizeCoin(toToken, provider?.toAmount || 0),
    [toToken, provider, normalizeCoin],
  );

  // TODO: implement paymentMethod
  const exchange = {
    paymentMethod: {},
    id: provider.provider,
    exchangerFee: provider?.rate || 0,
    transactionFee: 0,
    ...provider,
  };

  const disabled = useMemo(
    () =>
      loading ||
      !provider ||
      !from ||
      !to ||
      balanceError ||
      fromTokenError ||
      !Number(fromInputValue) ||
      Object.values(errors).filter((err) => Boolean(err)),
    [
      loading,
      provider,
      from,
      to,
      balanceError,
      fromTokenError,
      fromInputValue,
      errors,
    ],
  );

  const submitText = useMemo(() => {
    if (fromTokenError && fromToken?.decimals) {
      return t('swapTooManyDecimalsError', [
        fromToken.symbol,
        fromToken.decimals,
      ]);
    }
    if (balanceError) {
      return t('swapsNotEnoughForTx', [fromToken?.symbol || '']);
    }
    if (!Number(fromInputValue)) {
      return t('enterANumber');
    }
    return t(hasApproval ? 'confirm' : 'approve');
  }, [fromTokenError, fromToken, balanceError, fromInputValue, t, hasApproval]);

  const findTransaction = useCallback(
    async (id) => {
      const tsx = await dispatch(getTransactionById(id));
      return tsx.find((searchTx) => searchTx.id === id);
    },
    [dispatch],
  );

  const checkFinishedTx = useCallback(
    async (tx) => {
      if (!tx) {
        throw new Error('Runtime exception! No transaction data!');
      }
      let counter = 0;
      const timeout = 500;
      return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          counter += 1;
          if (counter * timeout > MINUTE * 3) {
            clearInterval(interval);
            return null;
          }
          const updatedTx = await findTransaction(tx.id);
          const { status } = updatedTx;
          switch (status) {
            case TransactionStatus.rejected:
            case TransactionStatus.failed:
              clearInterval(interval);
              return reject(TransactionStatus.rejected);
            case TransactionStatus.confirmed:
              clearInterval(interval);
              return resolve(updatedTx);
            default:
              return null;
          }
        }, timeout);
      });
    },
    [findTransaction],
  );

  const handleApprove = useCallback(async () => {
    const params = { fromInput: from, toInput: to, exchange };
    const options = {
      provider: providerName,
      redirectError: false,
      approvalValue: customApproveValue,
    };

    const approvalData = await dispatch(
      signAndSendTransactions(history, params, options),
    );
    if (!approvalData?.txMeta || !approvalData.txMeta.id) {
      throw new Error('Unexpected error dex approval transaction!');
    }
    const { txMeta: { id: txId } = {} } = approvalData;

    const res = await new Promise((resolve, reject) => {
      return dispatch(
        showModal({
          name: 'CONFIRM_TOKEN_TRANSACTION',
          txId,
          onSubmit: resolve,
          onSubmitError: reject,
          onCancel: () => {
            toast.info(
              `This is required and gives ${providerName} permission to swap your ${from.asset.symbol} ${from.asset.standard}.`,
            );
            throw new Error('Permission is required to swap token!');
          },
          onCancelError: reject,
          onHide: () => {
            resolve();
          },
        }),
      );
    });
    if (!res) {
      return;
    }

    const r = await checkFinishedTx(res);
    if (!r) {
      throw new Error('Unexpected exception confirm transaction!');
    }
    await dispatch(
      getDEXRates(
        {
          from: from.asset,
          to: to.asset,
          amount: from.amount,
        },
        providerName,
      ),
    );
    dispatch(hideModal());
  }, [
    from,
    to,
    exchange,
    providerName,
    customApproveValue,
    dispatch,
    history,
    checkFinishedTx,
  ]);

  const handleSwap = useCallback(async () => {
    const params = { fromInput: from, toInput: to, exchange };
    const options = { provider: providerName, redirectError: false };
    const swapData = await dispatch(
      signAndSendTransactions(history, params, options),
    );
    const { txMeta: { id: txId } = {} } = swapData;
    if (!txId) {
      throw new Error('Unexpected error dex swap transaction!');
    }
    try {
      const res = await new Promise((resolve, reject) => {
        return dispatch(
          showModal({
            name: 'CONFIRM_TOKEN_TRANSACTION',
            txId,
            onSubmit: resolve,
            onSubmitError: reject,
            onCancel: reject,
            onCancelError: reject,
            onHide: () => {
              resolve();
            },
            onSwapNew: () => {
              resolve();
            },
            onModalConfirm: () => {
              history.push(DEFAULT_ROUTE);
            },
          }),
        );
      });

      if (!res) {
        return;
      }

      const r = await checkFinishedTx(res);
      if (!r) {
        throw new Error('Unexpected exception confirm transaction!');
      }
      toast.success('Swap!');
    } catch (err) {
      dispatch(hideModal());
    }
  }, [from, to, exchange, providerName, dispatch, history, checkFinishedTx]);

  const handleConfirm = useCallback(async () => {
    try {
      dispatch(setRedirectOverviewPage(window?.location?.hash));
      if (!hasApproval) {
        await handleApprove();
      }
      await handleSwap();
    } catch (err) {
      toast.error(err?.message || err);
    } finally {
      await dispatch(setDEXExchangesLoading(false));
    }
  }, [dispatch, hasApproval, handleApprove, handleSwap]);

  // dispatch(setDEXExchangesLoading(false));

  return (
    <SwapsFooter
      onSubmit={handleConfirm}
      submitText={submitText}
      // disabled={disabled}
      hideCancel
      showTermsOfService={!disabled}
    />
  );
};

export default memo(DexExchangeFooter);
