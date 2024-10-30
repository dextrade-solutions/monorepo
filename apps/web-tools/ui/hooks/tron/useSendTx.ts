import { AssetModel } from 'dex-helpers/types';
import { useSelector } from 'react-redux';
import { parseUnits } from 'viem';

import buildTx from '../../../app/helpers/tron/build-tx';
import { signAndBroadcastTx } from '../../../app/helpers/tron/sign-and-broadcast-tx';
import { getAssetAccount } from '../../ducks/app/app';

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
    const value = parseUnits(String(amount), asset.decimals);
    if (!assetAccount) {
      throw new Error('txSend - No tron address provided');
    }
    const unsignedTx = await buildTx(assetAccount.address, recipient, value);
    return signAndBroadcastTx(unsignedTx)
      .then(txSentHandlers.onSuccess)
      .catch(txSentHandlers.onError);
  };
  return txSend;
}
