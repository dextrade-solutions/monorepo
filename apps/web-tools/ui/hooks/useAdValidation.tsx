import { Typography } from '@mui/material';
import { formatFundsAmount, getAdLimitPerExchange } from 'dex-helpers';
import { AdItem } from 'dex-helpers/types';
import React from 'react';

import type { useAssetInput } from './asset/useAssetInput';
import { useI18nContext } from './useI18nContext';

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
  const t = useI18nContext();

  let tickerFrom = ad.fromCoin.ticker;
  let tickerTo = ad.toCoin.ticker;

  if (tickerFrom === tickerTo) {
    tickerFrom = ad.fromCoin.networkType;
    tickerTo = ad.toCoin.networkType;
  }

  const params: ValidationParams = {
    submitBtnText: t('Start Swap'), // Changed here
    hasValidationErrors: false,
    disabledBtn: false,
  };
  if (
    assetInputFrom.amount &&
    Number(assetInputFrom.amount) < Number(ad.minimumExchangeAmountCoin1)
  ) {
    params.submitBtnText = `${t('Min amount is')} ${ad.minimumExchangeAmountCoin1} ${tickerFrom}`; // Changed here
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }
  if (
    assetInputTo.amount &&
    Number(assetInputTo.amount) < Number(ad.minimumExchangeAmountCoin2)
  ) {
    params.submitBtnText = `${t('Min amount is')} ${ad.minimumExchangeAmountCoin2} ${tickerTo}`; // Changed here
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }

  if (!assetInputFrom.amount || !assetInputTo.amount) {
    params.disabledBtn = true;
    params.hasValidationErrors = true;
    params.submitBtnText = t('Enter the amount to swap'); // Changed here
    return params;
  }
  if (
    assetInputFrom.amount &&
    Number(assetInputFrom.balance?.value) < Number(assetInputFrom.amount)
  ) {
    params.submitBtnText = `${t('Insufficient')} ${tickerFrom} ${t('balance')}`; // Changed here
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }
  if (
    assetInputTo.amount &&
    getAdLimitPerExchange(ad) < Number(assetInputTo.amount)
  ) {
    params.submitBtnText = `${t(
      'Max limit in',
    )} ${formatFundsAmount(getAdLimitPerExchange(ad))} ${tickerTo} ${t(
      'exceeded',
    )}`; // Changed here
    params.hasValidationErrors = true;
    params.disabledBtn = true;
    return params;
  }
  if (!assetInputTo.asset.isFiat && !assetInputTo.account?.address) {
    params.submitBtnText = (
      <Typography>
        {t('Set your')} <strong>{tickerTo}</strong> {t('wallet')}{' '}
        {/* Changed here */}
      </Typography>
    );
    return params;
  }
  if (assetInputTo.asset.isFiat && !assetInputTo.paymentMethod) {
    params.submitBtnText = t('Set payment method'); // Changed here
    return params;
  }
  return params;
}
