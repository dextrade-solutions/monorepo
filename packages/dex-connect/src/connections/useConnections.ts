import EventEmitter from 'events';
import { useQuery } from 'wagmi/query';

import { WalletConnectionType } from '../constants';
import { DextradeProvider } from '../providers/dextrade-provider';
import { ConnectionProvider } from '../providers/interface';
import { MultiverseExtension } from '../providers/multiversx-provider';
import { SatsConnectProvider } from '../providers/sats-connect-provider';
import { useEVMProviders } from '../providers/useEVMProviders';
import { useTronProviders } from '../providers/useTronProviders';
import { getWalletIcon, WALLETS_META } from '../utils';
import { useConnectionState } from './useConnectionState';
import { useSolanaProviders } from '../providers/useSolanaProviders';
import {
  Connection,
  ConnectionHub,
  TxSendParams,
  UseConnectionsResult,
  WalletConnection,
} from '../types.d';

export function useConnections({
  wagmiConfig,
  connectionType,
}: {
  wagmiConfig: any;
  connectionType?: WalletConnectionType[];
}): UseConnectionsResult {
  const connectState = useConnectionState();
  const evmProviders = useEVMProviders({ config: wagmiConfig });
  const solanaProviders = useSolanaProviders();
  const tronProviders = useTronProviders();

  const hub = new EventEmitter() as ConnectionHub;

  let providers: ConnectionProvider[] = [
    new DextradeProvider(),
    ...evmProviders,
    ...tronProviders,
    ...solanaProviders,
    new SatsConnectProvider(),
    new MultiverseExtension(),
  ];
  if (connectionType) {
    providers = providers.filter((provider) =>
      connectionType.includes(provider.type),
    );
  }
  const connections = providers.map((instance): Connection => {
    const icon = instance.icon || getWalletIcon(instance.name);
    const { name, type } = instance;
    const id = `${name}:${type}`;
    return {
      id,
      meta: WALLETS_META.find((i) => i.name.includes(name.toLowerCase())),
      connectionType: instance.type,
      icon,
      name,
      get connected() {
        return connectState.isConnected(id);
      },
      async connect() {
        hub.emit('connection:start', id);
        const address = await instance.connect();
        const walletConnection: WalletConnection = {
          connectionType: type,
          walletName: name,
          address,
        };
        connectState.addWalletConnection(walletConnection);
        hub.emit('connection:success', walletConnection);
        return walletConnection;
      },
      async disconnect() {
        connectState.removeWalletConnection(id);
        hub.emit('disconnected', connectState.walletConnections[id]);
        await instance.disconnect();
      },
      signMessage: instance.signMessage.bind(instance),
      async txSend({ asset, amount, recipient, txSentHandlers }: TxSendParams) {
        if (!asset.decimals) {
          throw new Error('no decimals provided');
        }
        if (!(await instance.isAuthorized())) {
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
  return {
    connections: useQuery({
      queryKey: ['dex-connect', connectionType, connectState.walletConnections],
      queryFn: () => connections,
    }),
    hub,
  };
}
