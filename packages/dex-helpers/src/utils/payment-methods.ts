import { DextradeTypes } from 'dex-services';

import { PaymentContentTypes, PaymentMethodTypes } from '../constants';

const MASKS = {
  [PaymentContentTypes.cardNumber]: (cardNumber: string) => {
    // Define the number of visible digits at the beginning and end
    const visibleDigits = 4;

    // Create the masked card number with asterisks
    const maskedPart = '**** ';
    const visibleEnd = cardNumber.substr(-visibleDigits);

    // Combine and return the masked card number
    const maskedCardNumber = maskedPart + visibleEnd;
    return maskedCardNumber;
  },
};

const CONFIG = {
  priorityContentFields: [
    PaymentContentTypes.cardNumber,
    PaymentContentTypes.ibanOrCardNumber,
    PaymentContentTypes.iban,
    PaymentContentTypes.phone,
    PaymentContentTypes.bankName,
    PaymentContentTypes.ban,
  ],
  transliterateNames: [PaymentMethodTypes.wireTransfer, PaymentMethodTypes.ban],
};

export const getStrPaymentMethodInstance = (
  paymentMethod: DextradeTypes.PaymentMethodsModel,
) => {
  const fieldsData = JSON.parse(paymentMethod.data);
  const priorityContentType = CONFIG.priorityContentFields.find(
    (contentType) => fieldsData[contentType] !== undefined,
  );
  const value = priorityContentType
    ? fieldsData[priorityContentType]
    : paymentMethod.paymentMethod.name;
  const mask = MASKS[priorityContentType];
  return mask ? mask(value) : value;
};

export const humanizePaymentMethodName = (v: string, t: any) => {
  if (CONFIG.transliterateNames.includes(v)) {
    return t(v);
  }
  return v;
};
