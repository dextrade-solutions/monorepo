import { AdItem } from 'dex-helpers/types';

import type { useAssetInput } from './asset/useAssetInput';
import { validateAddress } from '../../app/helpers/chain-helpers/validate-address';

type AdParams = {
  ad: AdItem;
  assetInputFrom: ReturnType<typeof useAssetInput>;
  assetInputTo: ReturnType<typeof useAssetInput>;
};

export function useAdValidation({
  assetInputFrom,
  assetInputTo,
  ad,
}: AdParams) {
  const params = {
    submitBtnText: 'Start Swap',
    hasValidationErrors: false,
    disabledBtn: false,
  };
  if (
    assetInputFrom.amount &&
    Number(assetInputFrom.amount) < Number(ad.minimumExchangeAmountCoin1)
  ) {
    params.submitBtnText = `Min amount is ${ad.minimumExchangeAmountCoin1} ${assetInputFrom.asset.symbol}`;
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }
  if (
    assetInputFrom.amount &&
    Number(assetInputFrom.amount) > Number(ad.maximumExchangeAmountCoin1)
  ) {
    params.submitBtnText = `Max amount is ${ad.maximumExchangeAmountCoin1} ${assetInputFrom.asset.symbol}`;
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }
  if (
    assetInputTo.amount &&
    Number(assetInputTo.amount) < Number(ad.minimumExchangeAmountCoin2)
  ) {
    params.submitBtnText = `Min amount is ${ad.minimumExchangeAmountCoin2} ${assetInputTo.asset.symbol}`;
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }

  if (
    assetInputTo.amount &&
    Number(assetInputTo.amount) > Number(ad.maximumExchangeAmountCoin2)
  ) {
    params.submitBtnText = `Max amount is ${ad.maximumExchangeAmountCoin2} ${assetInputTo.asset.symbol}`;
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }
  if (
    assetInputFrom.amount &&
    Number(assetInputFrom.balance?.value) < Number(assetInputFrom.amount)
  ) {
    params.submitBtnText = `Insufficient ${assetInputFrom.asset.symbol} balance`;
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }
  if (!assetInputFrom.amount || !assetInputTo.amount) {
    params.disabledBtn = true;
    return params;
  }
  if (
    assetInputTo.amount &&
    Number(ad.reserveInCoin2) < Number(assetInputTo.amount)
  ) {
    params.submitBtnText = `Ad limit in ${assetInputTo.asset.symbol} exceeded`;
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }
  if (
    !assetInputTo.asset.isFiat &&
    !assetInputTo.account?.address &&
    !assetInputTo.configuredWallet?.address
  ) {
    params.submitBtnText = 'Set recepient wallet';
    return params;
  }
  if (
    assetInputTo.configuredWallet &&
    !validateAddress(assetInputTo.asset, assetInputTo.configuredWallet.address)
  ) {
    params.submitBtnText = 'Recepient address is not valid';
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }
  if (assetInputTo.asset.isFiat && !assetInputTo.paymentMethod) {
    params.submitBtnText = 'Set payment method';
    return params;
  }
  return params;
}
