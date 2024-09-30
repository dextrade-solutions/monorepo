import { UserPaymentMethod } from '../../app/scripts/controllers/dextrade/types';
import { maskCardNumber } from '../modules/p2p-utils';

enum PaymentContentTypes {
  additionalInfo = 'ADDITIONAL_INFO',
  cardNumber = 'CARD_NUMBER',
  iban = 'IBAN',
  ibanOrCardNumber = 'IBAN_OR_CARD_NUMBER',
  image = 'IMAGE',
  email = 'EMAIL',
  numberOnly = 'NUMBER_ONLY',
  last4digits = 'LAST_4_DIGITS',
  phone = 'PHONE',
  username = 'USERNAME',
  fullName = 'FULL_NAME',
  bankName = 'BANK_NAME',
  accountOpeningDepartment = 'ACCOUNT_OPENING_DEPARTMENT',
  ban = 'BAN',
  imageQr = 'IMAGE_QR',
}

enum PaymentMethodTypes {
  wireTransfer = 'WIRE_TRANSFER', // swift transfer
  ban = 'BANK_TRANSFER', // bank transfer
}

const MASKS = {
  [PaymentContentTypes.cardNumber]: maskCardNumber,
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
  paymentMethod: UserPaymentMethod,
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
