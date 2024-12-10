import { AssetModel } from 'dex-helpers/types';
import { useSelector } from 'react-redux';
import { useConnectors, useSendTransaction, useSwitchChain } from 'wagmi';

import { generateTxParams } from '../../../app/helpers/transactions';
import { getAssetAccount } from '../../ducks/app/app';

export default function useSendTx(asset: AssetModel) {
  const assetAccount = useSelector((state) => getAssetAccount(state, asset));

  const { sendTransaction } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const connectors = useConnectors();

  const txSend = async (
    recipient: string,
    amount: number,
    txSentHandlers: {
      onSuccess: (txHash: string) => void;
      onError: (e: unknown) => void;
    },
  ) => {
    const connectedWallet = assetAccount?.walletName;
    const connector = connectors.find((i) => i.name === connectedWallet);

    if (!connector) {
      throw new Error('No connector found');
    }

    const isConnected = await connector.isAuthorized();
    if (!isConnected) {
      await connector?.connect();
    }
    const approveTx = async () => {
      const txParams = generateTxParams({
        asset,
        amount,
        to: recipient,
      });
      sendTransaction(
        { connector, chainId: asset.chainId, ...txParams },
        txSentHandlers,
      );
    };
    return switchChain(
      { connector, chainId: asset.chainId },
      {
        onSuccess: approveTx,
        onError: (e) => {
          console.error(e);
          // try execute makeTransaction without switching
          approveTx();
        },
      },
    );
  };
  return txSend;
}
