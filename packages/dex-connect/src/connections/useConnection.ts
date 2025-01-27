import { AssetModel } from 'dex-helpers/types';
import { useState } from 'react';
import { parseUnits } from 'viem';
import { useQuery } from 'wagmi/query';

import { getWalletIcon } from '../utils';

export function useConnection(instance: any) {
  // const state = useConnectionState();
  const [connectionState, setConnectionState] = useState(null);
  const icon = instance.icon || getWalletIcon(instance.name);
  const { name, type } = instance;
  const id = `${name}:${type}`;

  if (!instance) {
    throw new Error('Connection not found');
  }

  return useQuery({
    queryKey: ['dex-connect', id, connectionState],
    queryFn: () => ({
      id,
      connectionType: instance.type,
      icon,
      name,
      get connected() {
        return connectionState;
      },
      async connect() {
        const address = await instance.connect();
        const walletConnection = {
          connectionType: type,
          walletName: name,
          address,
        };
        setConnectionState(walletConnection);
        return walletConnection;
      },
      async disconnect() {
        await instance.disconnect();
        setConnectionState(null);
      },
      signMessage: instance.signMessage.bind(instance),
      async txSend({
        asset,
        amount,
        recipient,
        txSentHandlers,
      }: {
        asset: AssetModel;
        recipient: string;
        amount: number;
        txSentHandlers?: {
          onSuccess: (txHash: string) => void;
          onError: (e: unknown) => void;
        };
      }) {
        if (!asset.decimals) {
          throw new Error('no decimals provided');
        }
        const value = parseUnits(String(amount), asset.decimals);
        if (!instance.isConnected) {
          await instance.connect();
        }
        return instance
          .txSend({
            contractAddress: asset.contract,
            recipient,
            value,
            amount,
          })
          .then(txSentHandlers?.onSuccess)
          .catch(txSentHandlers?.onError);
      },
    }),
  });
}
