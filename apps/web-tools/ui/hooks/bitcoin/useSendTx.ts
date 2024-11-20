import Wallet from 'sats-connect';
import { parseUnits } from 'viem';

export default function useSendTx() {
  const txSend = async (
    recipient: string,
    amount: number,
    txSentHandlers: {
      onSuccess: (txHash: string) => void;
      onError: (e: unknown) => void;
    },
  ) => {
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
  };

  return txSend;
}
