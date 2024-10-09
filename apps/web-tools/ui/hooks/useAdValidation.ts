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
  let submitBtnError;
  let disabledBtn = false;
  if (
    assetInputFrom.amount &&
    Number(assetInputFrom.balance?.value) < Number(assetInputFrom.amount)
  ) {
    submitBtnError = `Insufficient ${assetInputFrom.asset.symbol} balance`;
    disabledBtn = true;
  }
  if (!assetInputFrom.amount || !assetInputTo.amount) {
    disabledBtn = true;
  }
  if (
    assetInputTo.amount &&
    Number(ad.reserveInCoin2) < Number(assetInputTo.amount)
  ) {
    submitBtnError = `Ad limit in ${assetInputTo.asset.symbol} exceeded`;
    disabledBtn = true;
  }
  if (
    !assetInputTo.asset.isFiat &&
    !assetInputTo.account.address &&
    !assetInputTo.configuredWallet?.address
  ) {
    submitBtnError = 'Recepient address is not specified';
    disabledBtn = true;
  }
  if (
    assetInputTo.configuredWallet &&
    !validateAddress(assetInputTo.asset, assetInputTo.configuredWallet.address)
  ) {
    submitBtnError = 'Recepient address is not valid';
    disabledBtn = true;
  }
  return {
    disabledBtn,
    submitBtnError,
  };
}
