import { isTMA } from '@telegram-apps/sdk';
import { formatFundsAmount, NetworkNames } from 'dex-helpers';
import {
  AdItem,
  AssetModel,
  CoinModel,
  UserPaymentMethod,
} from 'dex-helpers/types';
import { useGlobalModalContext } from 'dex-ui';
import { floor } from 'lodash';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { parseUnits } from 'viem';

import { useAssetBalance } from './useAssetBalance';
import { useSendTransaction } from './useSendTransaction';
import { useWallets } from './useWallets';
import { getAdPathname, getNative } from '../../../app/helpers/p2p';
import { fetchRates } from '../../../app/helpers/rates';
import { getAssetAccount, setAssetAccount } from '../../ducks/app/app';
import { WalletConnection } from '../../types';
import { useAuthP2P } from '../useAuthP2P';

export const useAssetInput = ({
  asset,
  isToAsset,
  ad,
}: {
  asset: AssetModel;
  isToAsset?: boolean;
  ad: AdItem;
}) => {
  const { showModal } = useGlobalModalContext();
  const dispatch = useDispatch();
  const { login } = useAuthP2P();
  const wallets = useWallets();
  const walletConnection = useSelector((state) =>
    getAssetAccount(state, asset),
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

  const canChooseWallet = asset.network !== NetworkNames.fiat;
  const canPasteWallet = Boolean(isToAsset) && !asset.isFiat;
  const canChoosePaymentMethod = Boolean(isToAsset) && asset.isFiat;
  const walletId =
    walletConnection &&
    `${walletConnection.walletName}:${walletConnection.connectionType}`;
  const wallet = wallets.find((w) => w.id === walletId);
  const { sendTransaction } = useSendTransaction(asset);

  const showConfigureWallet = () => {
    const amount = Number(inputAmount);
    const adPath = getAdPathname({
      fromNetworkName: ad.fromCoin.networkName,
      fromTicker: ad.fromCoin.ticker,
      toNetworkName: ad.toCoin.networkName,
      toTicker: ad.toCoin.ticker,
      name: ad.name,
      amount: formatFundsAmount(
        isToAsset ? amount / ad.coinPair.price : amount,
      ),
    });

    showModal({
      name: 'SET_WALLET',
      asset,
      isToAsset,
      value: walletConnection,
      adPath,
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

  const makeTransfer = (recipient: string) => {
    sendTransaction(recipient, Number(inputAmount), {
      onSuccess: (txHash) => {
        console.info(txHash);
      },
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
    inputAmount && asset.decimals
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
    makeTransfer,
    showDeposit,
  };
};
