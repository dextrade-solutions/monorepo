import { getAssetKey } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import { useDispatch, useSelector } from 'react-redux';
import { parseUnits } from 'viem';

import {
  getAssetAccounts,
  getWalletConnections,
  removeWalletConnection,
  setWalletConnection,
} from '../../ducks/app/app';
import { getWalletIcon } from '../../helpers/utils/util';

export default function useConnection(instance) {
  const dispatch = useDispatch();
  const connectedWallets = useSelector(getWalletConnections);
  const assetAccounts = useSelector(getAssetAccounts);

  if (!instance) {
    throw new Error('Connection not found');
  }

  return {
    connectionType: instance.type,
    icon: getWalletIcon(instance.name),
    name: instance.name,
    get id() {
      return `${this.name}:${this.connectionType}`;
    },
    get connected() {
      return connectedWallets[this.id];
    },
    async connect() {
      const address = await instance.connect();
      const walletConnection = {
        connectionType: this.connectionType,
        walletName: this.name,
        address,
      };
      dispatch(setWalletConnection(walletConnection));
      return walletConnection;
    },
    async disconnect() {
      await instance.disconnect();
      dispatch(removeWalletConnection(this.connected));
    },
    async txSend({
      asset,
      amount,
      recipient,
      txSentHandlers,
    }: {
      asset: AssetModel;
      recipient: string;
      amount: number;
      txSentHandlers: {
        onSuccess: (txHash: string) => void;
        onError: (e: unknown) => void;
      };
    }) {
      const key = getAssetKey(asset);
      const assetAccount = assetAccounts[key];
      const value = parseUnits(String(amount), asset.decimals);
      if (!assetAccount) {
        throw new Error('txSend - No address provided');
      }

      if (!instance.isConnected) {
        await instance.connect();
      }

      return instance
        .txSend({
          sender: assetAccount.address,
          recipient,
          value,
        })
        .then(txSentHandlers.onSuccess)
        .catch(txSentHandlers.onError);
    },
  };
}
