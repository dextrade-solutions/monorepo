import { isEqual } from 'lodash';
import React, { memo, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/button';
import {
  getFromToken,
  getFromTokenInputValue,
  getSwapOTC,
  getToToken,
  signAndSendTransactions,
} from '../../../ducks/swaps/swaps';
import { useCurrentTokens } from '../../../hooks/useCurrentTokens';
import { useI18nContext } from '../../../hooks/useI18nContext';
import SwapsFooter from '../swaps-footer';
import { normalizeTokenInput } from './helpers';

const OtcExchangeFooter = ({ provider, errors, onConfirm, loading }) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const history = useHistory();

  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const fromInputValue = useSelector(getFromTokenInputValue);
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
    () => loading || !provider || !from || !to || !Number(fromInputValue),
    [loading, provider, from, to, fromInputValue],
    // || Object.values(errors).filter((err) => Boolean(err)),
    // [loading, provider, from, to, fromInputValue, errors],
  );

  const submitText = useMemo(() => {
    console.log('errors', errors);
    return Number(fromInputValue) ? 'confirm' : 'enterANumber';
  }, [errors, fromInputValue]);

  const handleConfirm = useCallback(async () => {
    if (onConfirm) {
      onConfirm({
        from: fromToken,
        to: toToken,
        exchange,
        amountIn: fromInputValue,
        amountOut: 0,
      });
      return;
    }

    const params = { fromInput: from, toInput: to, exchange };
    const options = { provider: provider.provider, redirectError: false };
    try {
      await dispatch(signAndSendTransactions(history, params, options));
    } catch (err) {
      toast.error(err.message);
    }
  }, [
    dispatch,
    history,
    fromToken,
    toToken,
    from,
    to,
    exchange,
    provider,
    onConfirm,
    fromInputValue,
  ]);

  return (
    <SwapsFooter
      onSubmit={handleConfirm}
      submitText={t(submitText)}
      disabled={disabled}
      hideCancel
      showTermsOfService
    />
  );
};

export default memo(OtcExchangeFooter);
