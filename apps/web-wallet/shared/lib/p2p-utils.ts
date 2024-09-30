import _ from 'lodash';
import { ExchangerDirection } from '../../app/scripts/controllers/exchanger/types';

export const isSecureFieldsEqual = (
  preventDirection: any,
  newDirection: ExchangerDirection,
) => {
  const FIELDS_TO_COMPARE = [
    'to.ticker',
    'from.ticker',
    'walletAddress',
    'paymentMethod.data',
    'transactionFee',
    'slippage',
  ];
  return FIELDS_TO_COMPARE.every((field) =>
    _.isEqual(_.get(preventDirection, field), _.get(newDirection, field)),
  );
};
