import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { AssetModel } from 'dex-helpers/types';
import { useSelector } from 'react-redux';
import { parseUnits } from 'viem';

import { buildTxSol } from '../../../app/helpers/solana/send-sol';
import { getAssetAccount } from '../../ducks/app/app';

export default function useSendTx(asset: AssetModel) {
  const assetAccount = useSelector((state) => getAssetAccount(state, asset));
  const { publicKey, sendTransaction: sendTxSol } = useWallet();
  const { connection } = useConnection();

  const txSend = async (
    recepient: string,
    amount: number,
    txSentHandlers: {
      onSuccess: (txHash: string) => void;
      onError: (e: unknown) => void;
    },
  ) => {
    let from = publicKey;
    const value = parseUnits(String(amount), asset.decimals);

    if (assetAccount?.connectedWallet === 'LedgerLive') {
      from = new PublicKey(assetAccount.address);
    }

    if (!from) {
      throw new Error('sendTxSol - wallet is not connected');
    }
    const tx = await buildTxSol({
      asset,
      connection,
      fromPubkey: from,
      recepientAddress: recepient,
      value: Number(value),
    });
    return sendTxSol(tx, connection)
      .then(txSentHandlers.onSuccess)
      .catch(txSentHandlers.onError);
  };
  return txSend;
}
