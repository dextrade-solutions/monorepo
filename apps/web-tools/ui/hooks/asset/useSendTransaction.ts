import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { parseUnits } from 'viem';
import {
  useSwitchChain,
  useSendTransaction as useWcSendTransaction,
} from 'wagmi';

import { isEthTypeAsset } from '../../../app/helpers/chain-helpers/is-eth-type-asset';
import { buildTxSol } from '../../../app/helpers/sol-scripts/send-sol';
import { generateTxParams } from '../../../app/helpers/transactions';

export function useSendTransaction({
  from,
  to,
  amount,
  recepient,
  txSentHandlers,
}: {
  from: AssetModel;
  to: AssetModel;
  amount: number;
  recepient: string;
  txSentHandlers: {
    onSuccess: (txHash: string) => void;
    onError: (e: unknown) => void;
  };
}) {
  if (!from.decimals) {
    throw new Error('useSendTransaction - asset.decimals not specified');
  }
  let txSend;
  const value = parseUnits(String(amount), from.decimals);

  const { sendTransaction: sendTxEvm } = useWcSendTransaction();
  const { switchChain } = useSwitchChain();

  const { publicKey, sendTransaction: sendTxSol } = useWallet();
  const { connection } = useConnection();

  if (isEthTypeAsset(from)) {
    const evmTxSend = () => {
      const txParams = generateTxParams({
        asset: from,
        amount,
        to: recepient,
      });
      sendTxEvm({ ...txParams, chainId: asset.chainId }, txSentHandlers);
    };

    txSend = () =>
      switchChain(
        { chainId: from.chainId },
        {
          onSuccess: evmTxSend,
          onError: (e) => {
            console.error(e);
            // try execute makeTransaction without switching
            evmTxSend();
          },
        },
      );
  }

  if (from.network === NetworkNames.solana) {
    txSend = async () => {
      if (!publicKey) {
        throw new Error('sendTxSol - wallet is not connected');
      }
      const tx = await buildTxSol({
        from,
        to,
        connection,
        fromPubkey: publicKey,
        recepientAddress: recepient,
        value: Number(value),
      });
      return sendTxSol(tx, connection)
        .then(txSentHandlers.onSuccess)
        .catch(txSentHandlers.onError);
    };
  }
  return { sendTransaction: txSend };
}
