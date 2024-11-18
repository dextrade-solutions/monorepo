import { AdItem } from 'dex-helpers/types';

import type { useAssetInput } from './asset/useAssetInput';
import { validateAddress } from '../../app/helpers/chain-helpers/validate-address';

type AdParams = {
  ad: AdItem;
  assetInputFrom: ReturnType<typeof useAssetInput>;
  assetInputTo: ReturnType<typeof useAssetInput>;
  outgoingFee: number | undefined;
};

export function useAdValidation({
  assetInputFrom,
  assetInputTo,
  outgoingFee,
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
  if (!assetInputFrom.amount || !assetInputTo.amount) {
    params.disabledBtn = true;
    params.hasValidationErrors = true;
    params.submitBtnText = 'Enter the amount to swap';
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
  // if (
  //   outgoingFee &&
  //   Number(assetInputFrom.balanceNative?.value) < outgoingFee
  // ) {
  //   params.submitBtnText = `${assetInputFrom.balanceNative?.formattedValue} is insufficient for outgoing transaction fee`;
  //   // params.hasValidationErrors = true;
  //   // params.disabledBtn = true;
  //   return params;
  // }
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
    params.submitBtnText = 'Set recipient wallet';
    return params;
  }
  if (
    assetInputTo.configuredWallet &&
    !validateAddress(assetInputTo.asset, assetInputTo.configuredWallet.address)
  ) {
    params.submitBtnText = 'Recipient address is not valid';
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
