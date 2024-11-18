import { Adapter } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { NetworkNames } from 'dex-helpers';
import { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Config, Connector, useConfig, useConnectors } from 'wagmi';

import { disconnectAssetWallet } from '../../ducks/app/app';
import { WalletConnectionType } from '../../helpers/constants/wallets';
import { ledgerConnection } from '../../helpers/utils/ledger';
import { AssetAccount } from '../../types';

const getEIP6963SerilizedConnectedAccount = (
  // connections: Connection[],
  config: Config,
  connector: Connector,
): AssetAccount | null => {
  const connection = config.state.connections.get(connector.uid);
  if (connection) {
    const [address] = connection.accounts;
    return {
      icon: connection.connector.icon,
      connectedWallet: connection.connector.name,
      address,
    };
  }
  return null;
};

const getSolanaSerializedConnectedAccount = (adapter: Adapter) => {
  if (adapter.connected) {
    return {
      icon: adapter.icon,
      connectedWallet: adapter.name,
      address: adapter.publicKey.toBase58(),
    };
  }
  return null;
};

export type WalletItem = {
  icon?: string;
  name: string;
  connected: AssetAccount | null;
  connect: () => Promise<AssetAccount>;
  disconnect: () => Promise<void>;
};

const getConnectorIcon = (item: Connector) => {
  if (item.name === 'WalletConnect') {
    return '/images/icons/wallet-connect.svg';
  }
  return item.icon;
};

// if asset is not passed, shows only EVM wallets
export function useWallets({
  connectionType,
}: { connectionType?: WalletConnectionType[] } = {}) {
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const { wallets, select } = useWallet();
  const connectors = useConnectors();
  const config = useConfig();
  const dispatch = useDispatch();

  // setInterval(() => {
  //   forceUpdate();
  // }, 500);
  // const connections = useConnections({ config });

  const eip6963wallets = connectors.map((item) => ({
    connectionType: WalletConnectionType.eip6963,
    icon: getConnectorIcon(item),
    name: item.name,
    get connected() {
      return getEIP6963SerilizedConnectedAccount(config, item);
    },
    async connect() {
      const result = await item.connect();
      const [address] = result.accounts;
      config.state.connections.set(item.uid, {
        ...result,
        connector: item,
      });
      forceUpdate();
      return {
        address,
        connectedWallet: item.name,
        icon: getConnectorIcon(item),
      };
    },
    disconnect: async () => {
      const isConnected = await item.isAuthorized();
      if (isConnected) {
        await item.disconnect();
        config.state.connections.delete(item.uid);
        dispatch(disconnectAssetWallet(item.name));
        forceUpdate();
      }
    },
  }));

  const solanaWallets = wallets.map((item) => ({
    connectionType: WalletConnectionType.solana,
    icon: item.adapter.icon,
    name: item.adapter.name,
    connected: getSolanaSerializedConnectedAccount(item.adapter),
    connect: async (): Promise<AssetAccount> => {
      select(item.adapter.name);
      await item.adapter.connect();
      const address = item.adapter.publicKey?.toBase58();
      const { icon } = item.adapter;
      if (!address) {
        throw new Error('connect solana wallet - something is wrong');
      }
      return {
        address,
        connectedWallet: item.adapter.name,
        icon,
      };
    },
    disconnect: item.adapter.disconnect.bind(item),
  }));
  const ledger = [
    {
      connectionType: WalletConnectionType.ledger,
      icon: ledgerConnection.icon,
      name: ledgerConnection.name,
      connected: null,
      connect: (network: NetworkNames) => ledgerConnection.connect(network),
      disconnect: ledgerConnection.disconnect.bind(ledgerConnection),
    },
  ];
  const result = [...eip6963wallets, ...solanaWallets, ...ledger];
  if (connectionType) {
    return result.filter((w) => connectionType.includes(w.connectionType));
  }
  return result;
}
