import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';

import useSendTxBitcoin from '../bitcoin/useSendTx';
import useSendTxEvm from '../evm/useSendTx';
import useSendTxSolana from '../solana/useSendTx';
import useSendTxTron from '../tron/useSendTx';

function getSendTxHook(asset: AssetModel) {
  if (asset.network === NetworkNames.bitcoin) {
    return () => useSendTxBitcoin();
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

  return { sendTransaction: txSend };
}
