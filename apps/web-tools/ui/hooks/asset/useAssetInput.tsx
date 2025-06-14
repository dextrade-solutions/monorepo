import { WalletConnectionType } from 'dex-connect';
import { isMobileWeb, NetworkNames, WebViewBridge } from 'dex-helpers';
import { AssetModel, UserPaymentMethod } from 'dex-helpers/types';
import { useGlobalModalContext } from 'dex-ui';
import { floor } from 'lodash';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { parseUnits } from 'viem';

import { useAssetBalance } from './useAssetBalance';
import { useWallets } from './useWallets';
import { getNative } from '../../../app/helpers/p2p';
import { fetchRates } from '../../../app/helpers/rates';
import { getAssetAccount, setAssetAccount } from '../../ducks/app/app';
import { WalletConnection } from '../../types';
import { useAuthP2P } from '../useAuthP2P';

export const useAssetInput = ({
  asset,
  isToAsset,
  deeplinkPath,
  disableSetPaymentMethod,
}: {
  asset: AssetModel;
  isToAsset?: boolean;
  deeplinkPath?: string;
  disableSetPaymentMethod?: boolean;
}) => {
  const { showModal } = useGlobalModalContext();
  const dispatch = useDispatch();
  const { login } = useAuthP2P();
  const wallets = useWallets();
  const walletConnection = useSelector((state) =>
    asset ? getAssetAccount(state, asset) : null,
  );

  const [native, setNative] = useState<AssetModel>();
  const [paymentMethod, setPaymentMethod] = useState<UserPaymentMethod>();
  const [inputAmount, setInputAmount] = useState<number | string>();
  const [limits, setLimits] = useState<{
    max: number | null;
  }>({
    max: null,
  });
  const [loading, setLoading] = useState(false);
  const [loadingNative, setLoadingNative] = useState(false);

  useEffect(() => {
    const updateWallet = async () => {
      const result = await WebViewBridge.sendToNative('setAsset', {
        asset,
      });
      dispatch(
        setAssetAccount({
          asset,
          assetAccount: {
            walletName: 'Dextrade Wallet',
            connectionType: WalletConnectionType.dextrade,
            address: result.address,
          },
        }),
      );
    };

    if (isMobileWeb && asset?.iso) {
      updateWallet();
    }
  }, [asset?.iso]);

  const canChooseWallet = asset?.network !== NetworkNames.fiat;
  const canPasteWallet = Boolean(isToAsset) && !asset?.isFiat;
  const canChoosePaymentMethod =
    Boolean(isToAsset) && asset?.isFiat && !disableSetPaymentMethod;
  const walletId =
    walletConnection &&
    `${walletConnection.walletName}:${walletConnection.connectionType}`;
  const wallet = wallets.find((w) => w.id === walletId);
  // const { sendTransaction } = useSendTransaction(asset);

  const showConfigureWallet = () => {
    showModal({
      name: 'SET_WALLET',
      asset,
      isToAsset,
      value: walletConnection,
      adPath: deeplinkPath,
      onChange: (v: WalletConnection) => {
        dispatch(
          setAssetAccount({
            asset,
            assetAccount: v,
          }),
        );
      },
    });
  };

  const showPaymentMethod = (supportedIdsList?: number[]) => {
    login({
      onSuccess: () =>
        showModal({
          name: 'SET_PAYMENT_METHOD',
          asset,
          value: paymentMethod,
          supportedIdsList,
          onChange: (v) => setPaymentMethod(v),
        }),
    });
  };

  // const makeTransfer = (recipient: string) => {
  //   sendTransaction(recipient, Number(inputAmount), {
  //     onSuccess: (txHash) => {
  //       console.info(txHash);
  //     },
  //     onError: (err) => {},
  //   });
  // };

  // initialize
  useEffect(() => {
    if (!asset) {
      return;
    }
    if (asset.isNative || asset.isFiat) {
      setNative(asset);
      return;
    }
    try {
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
    } catch {
      // pass
    }
  }, []);

  const balance = useAssetBalance(asset, walletConnection?.address);
  const balanceNative = useAssetBalance(
    native || { ...asset, contract: null },
    walletConnection?.address,
  );

  const showDeposit = ({
    awaitingDepositAmount,
    onSuccess,
  }: {
    awaitingDepositAmount?: number;
    onSuccess: () => void;
  }) => {
    showModal({
      name: 'DEPOSIT_WALLET',
      asset: native,
      awaitingDepositAmount,
      description: 'To start the swap, you need to deposit the native token',
      address: walletConnection?.address,
      onSuccess,
    });
  };

  const onSetAmount = (v: string | number | null) => {
    const convertedAmount = floor(Number(v), 10);
    const newValue = convertedAmount || v;
    setInputAmount(newValue || '');
  };

  const value =
    inputAmount && asset?.decimals
      ? Number(parseUnits(Number(inputAmount).toFixed(10), asset.decimals))
      : inputAmount;

  return {
    asset,
    isToAsset,
    // input parameters
    amount: inputAmount,
    value,

    loading: loading || loadingNative,
    permissions: {
      canChooseWallet,
      canChoosePaymentMethod,
      canPasteWallet,
    },

    native,
    account: walletConnection,
    wallet,
    walletId,
    balance,
    balanceNative,
    paymentMethod,
    limits,
    setLoading,
    setInputAmount: onSetAmount,
    setLimits,
    showPaymentMethod,
    showConfigureWallet,
    // makeTransfer,
    showDeposit,
  };
};
