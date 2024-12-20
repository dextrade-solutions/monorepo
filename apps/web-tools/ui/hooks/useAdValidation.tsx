import { Typography } from '@mui/material';
import { AdItem } from 'dex-helpers/types';
import React from 'react';

import type { useAssetInput } from './asset/useAssetInput';
import { validateAddress } from '../../app/helpers/chain-helpers/validate-address';

type AdParams = {
  ad: AdItem;
  assetInputFrom: ReturnType<typeof useAssetInput>;
  assetInputTo: ReturnType<typeof useAssetInput>;
  outgoingFee: number | undefined;
};

type ValidationParams = {
  submitBtnText: string | React.ReactNode;
  hasValidationErrors: boolean;
  disabledBtn: boolean;
};

export function useAdValidation({
  assetInputFrom,
  assetInputTo,
  ad,
}: AdParams) {
  const params: ValidationParams = {
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
  if (
    assetInputTo.amount &&
    Number(ad.reserveInCoin2) < Number(assetInputTo.amount)
  ) {
    params.submitBtnText = `Ad limit in ${assetInputTo.asset.symbol} exceeded`;
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }
  if (!assetInputTo.asset.isFiat && !assetInputTo.account?.address) {
    params.submitBtnText = (
      <Typography>
        Set your <strong>{assetInputTo.asset.symbol}</strong> wallet
      </Typography>
    );
    return params;
  }
  if (
    assetInputTo.account &&
    !validateAddress(assetInputTo.asset, assetInputTo.account.address)
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
