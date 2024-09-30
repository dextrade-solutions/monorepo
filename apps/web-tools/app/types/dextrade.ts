export type Country = {
  id: number;
  iso: string;
  name: string;
};

export type Currency = {
  id: number;
  iso: string;
  name: string;
};

export type ConstructorField = {
  id: number;
  required: boolean;
  // no need to validate if it false
  validate: boolean;
  contentType: {
    description: string;
    value: string;
  };
  fieldType: {
    description: string;
    value: string;
  };
};

export type PaymentMethod = {
  paymentMethodId: string;
  name: string;
  fields: ConstructorField[];
};

export type UserPaymentMethod = {
  userPaymentMethodId?: number;
  data: string;
  country: Country;
  currency: Currency;
  paymentMethod: PaymentMethod;
};

export type AuthParams = {
  mnemonicHash: string;
  publicKey: string;
  masterPublicKey: string;
  signature: string;

  deviceId?: string;
  deviceToken?: string;
};
