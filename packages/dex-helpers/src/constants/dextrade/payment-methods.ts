export enum PaymentContentTypes {
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

export enum PaymentMethodTypes {
  wireTransfer = 'WIRE_TRANSFER', // swift transfer
  ban = 'BANK_TRANSFER', // bank transfer
}
