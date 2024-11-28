import { AssetModel } from 'dex-helpers/types';
import { useDispatch, useSelector } from 'react-redux';
import Wallet from 'sats-connect';
import { parseUnits } from 'viem';

import { getAssetAccount, showModal } from '../../ducks/app/app';
import { WalletConnectionType } from '../../helpers/constants/wallets';

export default function useSendTx(asset: AssetModel) {
  const dispatch = useDispatch();
  const assetAccount = useSelector((state) => getAssetAccount(state, asset));

  const txSend = async (
    recipient: string,
    amount: number,
    txSentHandlers: {
      onSuccess: (txHash: string) => void;
      onError: (e: unknown) => void;
    },
  ) => {
    if (assetAccount?.connectionType === WalletConnectionType.sats) {
      await Wallet.request('sendTransfer', {
        recipients: [
          {
            address: recipient,
            amount: Number(parseUnits(String(amount), 8)),
          },
        ],
      })
        .then((response) => {
          if (response.status === 'success') {
            txSentHandlers.onSuccess(response.result.txid);
          } else {
            throw new Error(response.error.message);
          }
        })
        .catch(txSentHandlers.onError);
    } else {
      dispatch(
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
        }),
      );
    }
  };

  return txSend;
}
