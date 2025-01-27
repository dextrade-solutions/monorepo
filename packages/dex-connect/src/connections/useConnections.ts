import { AssetModel } from 'dex-helpers/types';
import { useQuery } from 'wagmi/query';

import { WalletConnectionType } from '../constants';
import { useEVMProviders } from '../providers/useEVMProviders';
import { useTronProviders } from '../providers/useTronProviders';
import { getWalletIcon } from '../utils';
import { useConnectionState } from './useConnectionState';
import { useSolanaProviders } from '../providers/useSolanaProviders';

export function useConnections({
  wagmiConfig,
  connectionType,
}: { wagmiConfig: any; connectionType?: WalletConnectionType[] } = {}) {
  const connectState = useConnectionState();
  const evmProviders = useEVMProviders({ config: wagmiConfig });
  const solanaProviders = useSolanaProviders();
  const tronProviders = useTronProviders();

  let providers = [...evmProviders, ...tronProviders, ...solanaProviders];
  if (connectionType) {
    providers = providers.filter((provider) =>
      connectionType.includes(provider.type),
    );
  }
  const connections = providers.map((instance) => {
    const icon = instance.icon || getWalletIcon(instance.name);
    const { name, type } = instance;
    const id = `${name}:${type}`;
    return {
      id,
      connectionType: instance.type,
      icon,
      name,
      get connected() {
        return connectState.isConnected(id);
      },
      async connect() {
        const address = await instance.connect();
        const walletConnection = {
          connectionType: type,
          walletName: name,
          address,
        };
        connectState.addWalletConnection(walletConnection);
        return walletConnection;
      },
      async disconnect() {
        await instance.disconnect();
        connectState.removeWalletConnection(id);
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
        if (!instance.isConnected) {
          await instance.connect();
        }
        return instance
          .txSend({
            asset,
            recipient,
            amount,
          })
          .then(txSentHandlers?.onSuccess)
          .catch(txSentHandlers?.onError);
      },
    };
  });
  return useQuery({
    queryKey: ['dex-connect', connectionType, connectState.walletConnections],
    queryFn: () => connections,
  });
}
