import { NetworkNames } from 'dex-helpers';
import { AssetModel, UserPaymentMethod } from 'dex-helpers/types';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { showModal } from '../../ducks/app/app';
import { useAssetBalance } from '../useAssetBalance';
import { useAccount } from './useAccount';
import { getNative } from '../../../app/helpers/p2p';
import { fetchRates } from '../../../app/helpers/rates';
import { AssetAccount } from '../../types';

export const useAssetInput = ({
  asset,
  reserve: isToAsset,
}: {
  asset: AssetModel;
  reserve?: number;
}) => {
  const [native, setNative] = useState<AssetModel>();
  const [paymentMethod, setPaymentMethod] = useState<UserPaymentMethod>();
  const [inputAmount, setInputAmount] = useState<number | string>();
  const [configuredWallet, setConfiguredWallet] = useState<AssetAccount>();
  const [loading, setLoading] = useState(false);
  const [loadingNative, setLoadingNative] = useState(false);
  const account = useAccount(asset);
  const dispatch = useDispatch();
  const balance = useAssetBalance(asset);

  const canChooseWallet = asset.network !== NetworkNames.fiat;
  const canPasteWallet = Boolean(isToAsset) && !asset.isFiat;
  const canChoosePaymentMethod = Boolean(isToAsset) && asset.isFiat;
  const currentAccount =
    asset.network === NetworkNames.bitcoin
      ? configuredWallet
      : configuredWallet || account;

  const showConfigureWallet = () => {
    dispatch(
      showModal({
        name: 'SET_WALLET',
        asset,
        isToAsset,
        value: currentAccount,
        onChange: (v) => setConfiguredWallet(v),
      }),
    );
  };

  const showPaymentMethod = () => {
    dispatch(
      showModal({
        name: 'SET_PAYMENT_METHOD',
        asset,
        value: paymentMethod,
        onChange: (v) => setPaymentMethod(v),
      }),
    );
  };

  // initialize
  useEffect(() => {
    if (asset.isNative || asset.isFiat) {
      setNative(asset);
      return;
    }
    setLoadingNative(true);
    const nativeAsset = getNative(asset.network);
    fetchRates('USDT', [nativeAsset.symbol]).then((result) => {
      const rate = result.data.USDT[nativeAsset.symbol];
      setNative({
        ...nativeAsset,
        priceInUsdt: rate ? 1 / rate : undefined,
      });
      setLoadingNative(false);
    });
  }, [asset]);

  const onSetAmount = (v: string | number | null) => {
    return v ? setInputAmount(_.floor(Number(v), 8)) : setInputAmount('');
  };

  return {
    asset,
    isToAsset,
    // input parameters
    amount: inputAmount,
    loading: loading || loadingNative,
    configuredWallet,
    permissions: {
      canChooseWallet,
      canChoosePaymentMethod,
      canPasteWallet,
    },
    // calc props
    native,
    accountConnected: account,
    account: currentAccount,
    balance,
    paymentMethod,
    setLoading,
    setInputAmount: onSetAmount,
    showPaymentMethod,
    showConfigureWallet,
  };
};
