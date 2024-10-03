import {
  NetworkNames,
  PaymentContentTypes,
  PaymentMethodTypes,
} from 'dex-helpers';
import assetList from 'dex-helpers/assets-list';

import { UserPaymentMethod } from '../types/dextrade';
import { AssetModel, CoinModel } from '../types/p2p-swaps';

export function parseCoin(
  coin: CoinModel,
  priceInUsdt?: number,
): AssetModel | null {
  const asset = assetList.find(
    (item) =>
      item.network.toLowerCase() === coin.networkName.toLowerCase() &&
      item.symbol === coin.ticker,
  );
  if (asset) {
    return { ...asset, priceInUsdt };
  }
  return null;
}

export function getNative(network: NetworkNames) {
  const item = assetList.find(
    (item) => item.isNative && item.network === network,
  );
  if (!item) {
    throw new Error(`getNative - not found token with network ${network}`);
  }
  return item as AssetModel;
}

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
