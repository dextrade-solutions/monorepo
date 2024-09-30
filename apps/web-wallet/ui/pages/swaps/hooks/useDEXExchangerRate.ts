import { isEqual } from 'lodash';
import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useDebouncedEffect } from '../../../../shared/lib/use-debounced-effect';
import {
  getBalanceError,
  getDEXRates,
  getFromToken,
  getFromTokenError,
  getFromTokenInputValue,
  getSwapDEX,
  getToToken,
} from '../../../ducks/swaps/swaps';
import { useAssets } from '../../../hooks/useAssets';

// TODO: refactor otc/dex get quote/rate | set provider enum
export const useDEXExchangerRate = (provider: string = '') => {
  const dispatch = useDispatch();

  const fromTokenError = useSelector(getFromTokenError, isEqual);
  const balanceError = useSelector(getBalanceError);
  const { initialized, loading, providers } = useSelector(getSwapDEX);
  const { findToken } = useAssets();

  const inputValue = useSelector(getFromTokenInputValue);
  const prevInputValue = useRef<string>();

  const fromToken = useSelector(getFromToken, isEqual);
  const prevFromLocalIdRef = useRef<string>('');

  const toToken = useSelector(getToToken, isEqual);
  const prevToLocalIdRef = useRef<string>('');

  const getComparableParams = useCallback((): boolean => {
    return (
      inputValue === prevInputValue.current &&
      fromToken?.localId === prevFromLocalIdRef.current &&
      toToken?.localId === prevToLocalIdRef.current
    );
  }, [fromToken, toToken, inputValue]);

  const getAllowanceRequest = useCallback((): boolean => {
    if (
      !initialized ||
      !fromToken ||
      !toToken ||
      fromTokenError ||
      loading ||
      !inputValue ||
      !Number(inputValue) ||
      Number.isNaN(Number(inputValue)) ||
      ['.', ','].includes(inputValue.toString().substr(-1))
    ) {
      return false;
    }
    return !getComparableParams();
  }, [
    initialized,
    loading,
    fromTokenError,
    inputValue,
    fromToken,
    toToken,
    getComparableParams,
  ]);

  const getNormalizeParams = useCallback(() => {
    if (!fromToken || !toToken) {
      return {};
    }
    const [from, to] = [fromToken, toToken]
      .map((t) => {
        if (!t) {
          return null;
        }
        const ft = findToken(t?.symbol, t?.network);
        if (!ft) {
          return null;
        }
        return {
          ...ft,
          account: ft?.account || ft.getAccount(),
          contract: ft.contract,
          chainId: ft.chainId,
        };
      })
      .filter((t) => Boolean(t));
    return {
      from,
      to,
      amount: inputValue || '1',
    };
  }, [fromToken, toToken, inputValue, findToken]);

  const handleGetRates = useCallback(async () => {
    const params = getNormalizeParams();
    try {
      await dispatch(getDEXRates(params, provider));
    } catch (err) {
      toast.error(err.message);
    }
  }, [dispatch, provider, getNormalizeParams]);

  const setParams = useCallback(() => {
    prevFromLocalIdRef.current = fromToken?.localId;
    prevToLocalIdRef.current = toToken?.localId;
    prevInputValue.current = inputValue || '';
  }, [fromToken, toToken, inputValue]);

  const handleRequestEffect = useCallback(async () => {
    if (!getAllowanceRequest()) {
      return;
    }
    await handleGetRates();
    setParams();
  }, [getAllowanceRequest, handleGetRates, setParams]);

  useDebouncedEffect(
    () => {
      handleRequestEffect();
    },
    [fromToken, toToken, inputValue],
    650,
  );
};
