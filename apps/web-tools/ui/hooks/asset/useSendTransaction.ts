import { NetworkNames } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';

import useSendTxEvm from '../evm/useSendTx';
import useSendTxSolana from '../solana/useSendTx';
import useSendTxTron from '../tron/useSendTx';

function getSendTxHook(asset: AssetModel) {
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
  if (!asset.decimals) {
    throw new Error('useSendTransaction - asset.decimals not specified');
  }
  const useSendTx = getSendTxHook(asset);
  const txSend = useSendTx();

  return { sendTransaction: txSend };
}
