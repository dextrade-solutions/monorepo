import { maskCardNumber } from '../../../shared/modules/p2p-utils';
import { UserPaymentMethod } from '../../../app/scripts/controllers/dextrade/types';
import { PaymentContentTypes } from '../constants/payment-methods';

const MASKS = {
  [PaymentContentTypes.cardNumber]: maskCardNumber,
};

export const getStrPaymentMethodInstance = (
  paymentMethod: UserPaymentMethod,
) => {
  const fieldsData = JSON.parse(paymentMethod.data);
  const priority = [
    PaymentContentTypes.cardNumber,
    PaymentContentTypes.ibanOrCardNumber,
    PaymentContentTypes.iban,
    PaymentContentTypes.phone,
  ];
  const priorityContentType = priority.find(
    (contentType) => fieldsData[contentType] !== undefined,
  );
  const value = priorityContentType
    ? fieldsData[priorityContentType]
    : paymentMethod.paymentMethod.name;
  const mask = MASKS[priorityContentType];
  return mask ? mask(value) : value;
};
