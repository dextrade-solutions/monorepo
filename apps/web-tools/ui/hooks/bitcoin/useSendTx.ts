import { AssetModel } from 'dex-helpers/types';
import { useSelector } from 'react-redux';
import Wallet from 'sats-connect';
import { parseUnits } from 'viem';

import { getAssetAccount } from '../../ducks/app/app';
import { WalletConnectionType } from '../../helpers/constants/wallets';

export default function useSendTx(asset: AssetModel) {
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
    }
  };

  return txSend;
}
