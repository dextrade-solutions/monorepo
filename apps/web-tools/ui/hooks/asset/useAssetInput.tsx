import { AssetModel, UserPaymentMethod } from 'dex-helpers/types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { showModal } from '../../ducks/app/app';
import { useAssetBalance } from '../useAssetBalance';
import { useAccount } from './useAccount';
import { getNative } from '../../../app/helpers/p2p';
import { fetchRates } from '../../../app/helpers/rates';

export const useAssetInput = ({
  asset,
}: {
  asset: AssetModel;
  reserve?: number;
}) => {
  const [native, setNative] = useState<AssetModel>();
  const [paymentMethod, setPaymentMethod] = useState<UserPaymentMethod>();
  const [inputAmount, setInputAmount] = useState<number | string>();
  const [configuredWallet, setConfiguredWallet] = useState<{
    address: string;
    icon: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingNative, setLoadingNative] = useState(false);

  const account = useAccount(asset);
  const dispatch = useDispatch();
  const balance = useAssetBalance(asset);

  const showConfigureWallet = () => {
    dispatch(
      showModal({
        name: 'SET_WALLET',
        asset,
        value: configuredWallet,
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

  // initialize native
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

  return {
    asset,
    // input parameters
    amount: inputAmount,
    loading: loading || loadingNative,
    configuredWallet,

    // calc props
    native,
    account: configuredWallet ? { address: configuredWallet.address } : account,
    balance,
    paymentMethod,
    setLoading,
    setInputAmount,
    showPaymentMethod,
    showConfigureWallet,
  };
};
