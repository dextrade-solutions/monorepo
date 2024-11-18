import { NetworkNames, getAssetKey } from 'dex-helpers';
import { AssetModel, UserPaymentMethod } from 'dex-helpers/types';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useAssetBalance } from './useAssetBalance';
import { useSendTransaction } from './useSendTransaction';
import { getNative } from '../../../app/helpers/p2p';
import { fetchRates } from '../../../app/helpers/rates';
import {
  getAssetAccount,
  setAssetAccount,
  showModal,
} from '../../ducks/app/app';

export const useAssetInput = ({
  asset,
  isToAsset,
}: {
  asset: AssetModel;
  isToAsset?: boolean;
}) => {
  const configuredWallet = useSelector((state) =>
    getAssetAccount(state, asset),
  );

  const [native, setNative] = useState<AssetModel>();
  const [paymentMethod, setPaymentMethod] = useState<UserPaymentMethod>();
  const [inputAmount, setInputAmount] = useState<number | string>();
  const [loading, setLoading] = useState(false);
  const [loadingNative, setLoadingNative] = useState(false);
  const dispatch = useDispatch();

  const canChooseWallet = asset.network !== NetworkNames.fiat;
  const canPasteWallet = Boolean(isToAsset) && !asset.isFiat;
  const canChoosePaymentMethod = Boolean(isToAsset) && asset.isFiat;
  const { sendTransaction } = useSendTransaction(asset);

  const showConfigureWallet = () => {
    dispatch(
      showModal({
        name: 'SET_WALLET',
        asset,
        isToAsset,
        value: configuredWallet,
        onChange: (v) => {
          dispatch(
            setAssetAccount({
              asset,
              assetAccount: v,
            }),
          );
        },
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

  const makeTransfer = (recipient: string) => {
    sendTransaction(recipient, Number(inputAmount), {
      onSuccess: () => {},
      onError: (err) => {},
    });
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
  }, []);

  const balance = useAssetBalance(asset, configuredWallet?.address);
  const balanceNative = useAssetBalance(
    native || { ...asset, contract: null },
    configuredWallet?.address,
  );

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

    native,
    account: configuredWallet,
    balance,
    balanceNative,
    paymentMethod,
    setLoading,
    setInputAmount: onSetAmount,
    showPaymentMethod,
    showConfigureWallet,
    makeTransfer,
  };
};
