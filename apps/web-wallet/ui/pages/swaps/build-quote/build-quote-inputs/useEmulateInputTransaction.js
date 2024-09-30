import { isEqual } from 'lodash';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFromToken,
  setSwapsCustomGasFee,
} from '../../../../ducks/swaps/swaps';
import { emulateTransaction } from '../../../../store/actions';

export const useEmulateInputTransaction = () => {
  const dispatch = useDispatch();
  const fromToken = useSelector(getFromToken, isEqual);

  const onEmulate = useCallback(
    async (value, to) => {
      const { balance, decimals, account, localId } = fromToken;
      const contract = localId.split(':')[1];
      if (contract) {
        return value || balance / 10 ** decimals;
      }
      const amount = value || balance / 10 ** decimals;
      const destinationAddress = to || account;

      const result = await dispatch(
        emulateTransaction({
          sendToken: fromToken,
          amount,
          destinationAddress,
        }),
      );

      await dispatch(setSwapsCustomGasFee(result?.feeNormalized));

      return balance / 10 ** decimals - result?.feeNormalized;
    },
    [fromToken, dispatch],
  );

  return [onEmulate];
};
