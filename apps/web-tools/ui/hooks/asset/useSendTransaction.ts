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
  asset,
  amount,
  recipient,
  txSentHandlers,
}: {
  asset: AssetModel;
  amount: number;
  recipient: string;
  txSentHandlers: {
    onSuccess: (txHash: string) => void;
    onError: (e: unknown) => void;
  };
}) {
  if (!asset.decimals) {
    throw new Error('useSendTransaction - asset.decimals not specified');
  }
  let txSend;
  const value = parseUnits(String(amount), asset.decimals);

  const { sendTransaction: sendTxEvm } = useWcSendTransaction();
  const { switchChain } = useSwitchChain();

  const { publicKey, sendTransaction: sendTxSol } = useWallet();
  const { connection } = useConnection();

  if (isEthTypeAsset(asset)) {
    const evmTxSend = () => {
      const txParams = generateTxParams({
        asset,
        amount,
        to: recipient,
      });
      sendTxEvm({ ...txParams, chainId: asset.chainId }, txSentHandlers);
    };

    txSend = () =>
      switchChain(
        { chainId: asset.chainId },
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

  if (asset.network === NetworkNames.solana) {
    txSend = async () => {
      if (!publicKey) {
        throw new Error('sendTxSol - wallet is not connected');
      }
      const tx = await buildTxSol({
        asset,
        connection,
        fromPubkey: publicKey,
        recipientAddress: recipient,
        value: Number(value),
      });
      return sendTxSol(tx, connection)
        .then(txSentHandlers.onSuccess)
        .catch(txSentHandlers.onError);
    };
  }
  return { sendTransaction: txSend };
}
