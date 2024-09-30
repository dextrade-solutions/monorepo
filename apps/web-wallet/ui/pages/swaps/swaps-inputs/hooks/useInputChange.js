import BigNumber from 'bignumber.js';
import { debounce, isEqual } from 'lodash';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { calcTokenAmount } from '../../../../../shared/lib/transactions-controller-utils';
import {
  getBalanceError,
  getFromToken,
  setBalanceError,
  setFromTokenError,
  setFromTokenInputValue,
} from '../../../../ducks/swaps/swaps';
import { countDecimals } from '../../swaps.util';

export const useInputChange = () => {
  const dispatch = useDispatch();
  const balanceError = useSelector(getBalanceError);
  const fromToken = useSelector(getFromToken, isEqual);

  const onInputChange = useCallback(
    (newInputValue, inputBalance) => {
      if (!fromToken) {
        return;
      }
      const fromTokenBalance =
        fromToken.balance &&
        calcTokenAmount(fromToken.balance, fromToken.decimals).toString(10);

      const balance = inputBalance || fromTokenBalance;
      dispatch(
        setFromTokenInputValue(newInputValue),
      );
      const newBalanceError = new BigNumber(newInputValue.toString() || 0).gt(
        balance || 0,
      );

      // "setBalanceError" is just a warning, a user can still click on the "Review swap" button.
      if (balanceError !== newBalanceError) {
        dispatch(setBalanceError(newBalanceError));
      }
      dispatch(
        setFromTokenError(
          fromToken && countDecimals(newInputValue) > fromToken.decimals
            ? 'tooManyDecimals'
            : null,
        ),
      );
    },
    [dispatch, fromToken, balanceError],
  );

  const onDebounceInputChange = debounce(onInputChange, 600);

  return [onInputChange, onDebounceInputChange];
};
