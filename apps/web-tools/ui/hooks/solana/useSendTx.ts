import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { useSelector } from 'react-redux';
import { parseUnits } from 'viem';

import { buildTxSol } from '../../../app/helpers/solana/send-sol';
import { getAssetAccount } from '../../ducks/app/app';
import ledgerConnection from '../../helpers/utils/connections/ledger';

export default function useSendTx(asset: AssetModel) {
  const assetAccount = useSelector((state) => getAssetAccount(state, asset));
  const { sendTransaction: sendTxSol, connected, connect } = useWallet();
  const { connection } = useConnection();

  const txSend = async (
    recipient: string,
    amount: number,
    txSentHandlers: {
      onSuccess: (txHash: string) => void;
      onError: (e: unknown) => void;
    },
  ) => {
    if (!connected) {
      await connect();
    }
    const from = new PublicKey(assetAccount.address);

    const value = parseUnits(String(amount), asset.decimals);

    const transaction = await buildTxSol({
      asset,
      connection,
      fromPubkey: from,
      recipientAddress: recipient,
      value: Number(value),
    });

    if (assetAccount?.walletName === 'LedgerLive') {
      const { client } = await ledgerConnection.connect(NetworkNames.solana);

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = from;
      const serializedTx = transaction.serializeMessage();
      const signature = await client.signTransaction(
        "44'/501'/0'",
        serializedTx,
      );

      // Add the signature from Ledger to the transaction
      transaction.addSignature(
        new PublicKey(from),
        Buffer.from(signature.signature),
      );

      // Verify the signature and send the transaction
      const isVerified = transaction.verifySignatures();
      if (isVerified) {
        const rawTransaction = transaction.serialize();
        const txid = await connection.sendRawTransaction(rawTransaction);
        console.log('Transaction ID:', txid);
      } else {
        console.error('Signature verification failed.');
      }
    }
    return sendTxSol(transaction, connection)
      .then(txSentHandlers.onSuccess)
      .catch(txSentHandlers.onError);
  };
  return txSend;
}
