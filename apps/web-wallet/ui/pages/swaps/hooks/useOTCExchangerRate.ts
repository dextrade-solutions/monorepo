import { isEqual } from 'lodash';
import { useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useDebouncedEffect } from '../../../../shared/lib/use-debounced-effect';
import {
  getFromToken,
  getFromTokenInputValue,
  getOTCRates,
  getSwapOTC,
  getToToken,
  setBalanceError,
  setFromTokenError,
  setFromTokenInputValue,
} from '../../../ducks/swaps/swaps';
import { emulateTransaction } from '../../../store/actions';

export const useOTCExchangerRate = () => {
  const prevFromTokenRef = useRef(null);
  const prevToTokenRef = useRef(null);
  const prevAmountRef = useRef(null);

  const dispatch = useDispatch();
  const fromToken = useSelector(getFromToken, isEqual);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);
  const toToken = useSelector(getToToken, isEqual);
  const { initialized, loading } = useSelector(getSwapOTC);

  const isDisabled = useMemo(
    () => loading || !initialized,
    [loading, initialized],
  );

  const isEmptyTokenState = useMemo(
    () => !fromToken || !toToken,
    [fromToken, toToken],
  );

  const checkIsEqualTokenState = useCallback(
    () =>
      prevFromTokenRef.current === fromToken?.symbol &&
      prevToTokenRef.current === toToken?.symbol &&
      prevAmountRef.current === fromTokenInputValue,
    [fromToken, toToken, prevFromTokenRef, prevToTokenRef, fromTokenInputValue],
  );

  const updatePrevStateRefs = useCallback(() => {
    prevAmountRef.current = fromTokenInputValue;
    prevFromTokenRef.current = fromToken?.symbol;
    prevToTokenRef.current = toToken?.symbol;
  }, [fromTokenInputValue, fromToken, toToken]);

  // const emulateTransactionFrom = useCallback(async () => {
  //   const result = await dispatch(
  //     emulateTransaction({
  //       sendToken: fromToken,
  //       amount: fromTokenInputValue,
  //       destinationAddress: fromToken.account,
  //     }),
  //   );
  //
  //   const { balance, decimals } = fromToken;
  //
  //   const normalizeBalance = balance / 10 ** decimals;
  //
  //   if (fromTokenInputValue + result?.feeNormalized > normalizeBalance) {
  //     await dispatch(
  //       setFromTokenInputValue(normalizeBalance - result?.feeNormalized || 0),
  //     );
  //     await dispatch(
  //       setFromTokenError(
  //         `Insufficient balance. Fee: ${result?.feeNormalized}`,
  //       ),
  //     );
  //     await dispatch(setBalanceError(true));
  //     throw new Error(
  //       `Insufficient balance. Max amount: ${
  //         normalizeBalance - result?.feeNormalized
  //       }`,
  //     );
  //   }
  // }, [dispatch, fromToken, fromTokenInputValue]);

  const handleSearch = useCallback(async () => {
    if (
      isDisabled ||
      isEmptyTokenState ||
      checkIsEqualTokenState() ||
      !fromTokenInputValue ||
      !Number(fromTokenInputValue)
    ) {
      return;
    }
    const params = {
      coinFrom: fromToken,
      coinTo: toToken,
      amount: fromTokenInputValue || '0',
    };

    updatePrevStateRefs();

    try {
      // await emulateTransactionFrom();
      await dispatch(getOTCRates(params));
    } catch (err) {
      toast.error(err.message);
    }
  }, [
    dispatch,
    isDisabled,
    isEmptyTokenState,
    fromTokenInputValue,
    fromToken,
    toToken,
    checkIsEqualTokenState,
    updatePrevStateRefs,
  ]);

  useDebouncedEffect(
    () => {
      handleSearch();
    },
    [handleSearch],
    600,
  );
};
