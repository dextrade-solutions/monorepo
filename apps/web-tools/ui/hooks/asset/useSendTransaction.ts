import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { useDispatch, useSelector } from 'react-redux';

import { useWallets } from './useWallets';
import { getAssetAccount } from '../../ducks/app/app';
import useSendTxBitcoin from '../bitcoin/useSendTx';
import useSendTxEvm from '../evm/useSendTx';
import useSendTxSolana from '../solana/useSendTx';
import useSendTxTron from '../tron/useSendTx';
import { useGlobalModalContext } from 'dex-ui';

function getSendTxHook(asset: AssetModel) {
  if (asset.network === NetworkNames.bitcoin) {
    return () => useSendTxBitcoin(asset);
  }
  if (asset.network === NetworkNames.tron) {
    return () => useSendTxTron(asset);
  }
  if (asset.network === NetworkNames.solana) {
    return () => useSendTxSolana(asset);
  }
  if (asset.chainId) {
    return () => useSendTxEvm(asset);
  }
  return () => () => {
    throw new Error(
      'useSendTransaction - send transaction unavailable for this asset type',
    );
  };
}

export function useSendTransaction(asset: AssetModel) {
  const useSendTx = getSendTxHook(asset);
  const txSend = useSendTx();
  const { showModal } = useGlobalModalContext();

  const assetAccount = useSelector((state) => getAssetAccount(state, asset));
  const walletConnections = useWallets();
  const connection = walletConnections.find(
    ({ id }) =>
      id === `${assetAccount?.walletName}:${assetAccount?.connectionType}`,
  );

  const depositWallet = (
    recipient: string,
    amount: number,
    txSentHandlers: {
      onSuccess: (txHash: string) => void;
      onError: (e: unknown) => void;
    },
  ) => {
    showModal({
      name: 'DEPOSIT_WALLET',
      asset,
      awaitingDepositAmount: amount,
      address: recipient,
      manualConfirmation: true,
      description: `Please send ${asset.symbol} to the address below using any wallet exact deposit amount, and then press the confirm button.`,
      onSuccess: () => txSentHandlers.onSuccess('direct-transfer'),
      onClose: () =>
        txSentHandlers.onError(new Error('User rejected transfer')),
    });
  };

  if (!assetAccount) {
    return {
      sendTransaction: depositWallet,
    };
  }

  if (connection?.txSend) {
    return {
      sendTransaction: (
        recipient: string,
        amount: number,
        txSentHandlers: {
          onSuccess: (txHash: string) => void;
          onError: (e: unknown) => void;
        },
      ) =>
        connection.txSend({
          asset,
          recipient,
          amount,
          txSentHandlers,
        }),
    };
  }

  // TODO: change all implementation via connection.txSend
  return { sendTransaction: txSend };
}
