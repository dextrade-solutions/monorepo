import { validateAddress } from '../../app/helpers/chain-helpers/validate-address';
import {
  AdItem,
  AssetBalance,
  AssetInputValue,
  AssetModel,
} from '../../app/types/p2p-swaps';

type AdParams = {
  ad: AdItem;
  from: {
    asset: AssetModel;
    input: AssetInputValue;
    balance: AssetBalance | null;
  };
  to: {
    asset: AssetModel;
    input: AssetInputValue;
    balance: AssetBalance | null;
  };
};

export function useAdValidation({ from, to, ad }: AdParams) {
  let submitBtnError;
  let disabledBtn = false;
  if (
    from.input.amount &&
    Number(from.balance?.value) < Number(from.input.amount)
  ) {
    submitBtnError = `Insufficient ${from.asset.symbol} balance`;
    disabledBtn = true;
  }
  if (!from.input.amount || !to.input.amount) {
    disabledBtn = true;
  }
  if (to.input.amount && Number(ad.reserveInCoin2) < Number(to.input.amount)) {
    submitBtnError = `Ad limit in ${to.asset.symbol} exceeded`;
    disabledBtn = true;
  }
  if (!to.asset.isFiat && !to.account.address && !to.input.recepientAddress) {
    submitBtnError = 'Recepient address not specified';
    disabledBtn = true;
  }
  if (
    to.input.recepientAddress &&
    !validateAddress(to.asset, to.input.recepientAddress)
  ) {
    submitBtnError = 'Recepient address is not valid';
    disabledBtn = true;
  }
  return {
    disabledBtn,
    submitBtnError,
  };
}
