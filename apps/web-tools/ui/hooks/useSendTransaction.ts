import { useSendTransaction as useWcSendTransaction } from 'wagmi';

import { isEthTypeAsset } from '../../app/helpers/chain-helpers/is-eth-type-asset';
import { generateTxParams } from '../../app/helpers/transactions';
import { AssetModel } from '../../app/types/p2p-swaps';
import { NetworkNames } from 'dex-helpers';
import { solfareWalletClient } from '../../app/helpers/wallets/solfare';

export function useSendTransactions({
  asset,
  amount,
  recepient,
  txSentHandlers,
}: {
  asset: AssetModel;
  amount: string;
  recepient: string;
  txSentHandlers: { onSuccess: () => void; onError: () => void };
}) {
  const { sendTransaction } = useWcSendTransaction();

  let wrappedSendTransaction;

  if (isEthTypeAsset(asset)) {
    wrappedSendTransaction = () => {
      const txParams = generateTxParams({
        asset,
        amount,
        to: recepient,
      });
      sendTransaction({ ...txParams, chainId: asset.chainId }, txSentHandlers);
    };
  }

  if (asset.network === NetworkNames.solana) {
    const tx = new Trasaction
    const txSignature: string = solfareWalletClient.signAndSendTransaction();
  }
}
