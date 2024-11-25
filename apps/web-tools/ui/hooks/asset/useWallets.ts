import { useWallet } from '@solana/wallet-adapter-react';
import { NetworkNames } from 'dex-helpers';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Wallet, { AddressPurpose } from 'sats-connect';
import { useConnectors } from 'wagmi';

import {
  getWalletConnections,
  removeWalletConnection,
  setWalletConnection,
} from '../../ducks/app/app';
import { WalletConnectionType } from '../../helpers/constants/wallets';
import { ledgerConnection } from '../../helpers/utils/ledger';
import { getWalletIcon } from '../../helpers/utils/util';
import { WalletConnection } from '../../types';

export type WalletItem = {
  icon?: string;
  name: string;
  connected: WalletConnection | null;
  connect: () => Promise<WalletConnection>;
  disconnect: () => Promise<void>;
};

export function useWallets({
  connectionType,
}: { connectionType?: WalletConnectionType[] } = {}) {
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const { wallets, select } = useWallet();
  const connectors = useConnectors();
  const dispatch = useDispatch();

  const connectedWallets = useSelector(getWalletConnections);

  const eip6963wallets = connectors.map((item) => ({
    connectionType: WalletConnectionType.eip6963,
    icon: item.icon || getWalletIcon(item.name),
    name: item.name,
    get id() {
      return `${this.name}:${this.connectionType}`;
    },
    get connected() {
      return connectedWallets[this.id];
    },
    async connect() {
      const result = await item.connect();
      const [address] = result.accounts;
      const walletConnection = {
        connectionType: WalletConnectionType.eip6963,
        address,
        walletName: item.name,
      };
      dispatch(setWalletConnection(walletConnection));
      return walletConnection;
    },
    async disconnect() {
      const isConnected = await item.isAuthorized();
      if (isConnected) {
        await item.disconnect();
        forceUpdate();
      }
      if (this.connected) {
        dispatch(removeWalletConnection(this.connected));
      }
    },
  }));

  const satsWallets = [
    {
      connectionType: WalletConnectionType.sats,
      icon: getWalletIcon('xverse'),
      name: 'Xverse',
      get id() {
        return `${this.name}:${this.connectionType}`;
      },
      get connected() {
        return connectedWallets[this.id];
      },
      async connect() {
        const res = await Wallet.request('wallet_connect', {
          message: 'Cool app wants to know your addresses!',
          addresses: [AddressPurpose.Payment],
        });
        const [btcAddress] = res.result.addresses.filter((a) =>
          [AddressPurpose.Payment].includes(a.purpose),
        );

        const walletConnection = {
          connectionType: WalletConnectionType.sats,
          address: btcAddress.address,
          walletName: 'Xverse',
        };
        dispatch(setWalletConnection(walletConnection));
        return walletConnection;
      },
      async disconnect() {
        await Wallet.disconnect();
        dispatch(removeWalletConnection(this.connected));
      },
    },
  ];
  const solanaWallets = wallets.map((item) => ({
    connectionType: WalletConnectionType.solana,
    icon: item.adapter.icon,
    name: item.adapter.name,
    get id() {
      return `${this.name}:${this.connectionType}`;
    },
    get connected() {
      return connectedWallets[this.id];
    },
    connect: async () => {
      select(item.adapter.name);
      await item.adapter.connect();
      const address = item.adapter.publicKey?.toBase58();
      if (!address) {
        throw new Error('connect solana wallet - something is wrong');
      }

      const walletConnection = {
        connectionType: WalletConnectionType.solana,
        address,
        walletName: item.adapter.name,
      };
      dispatch(setWalletConnection(walletConnection));
      return walletConnection;
    },
    async disconnect() {
      await item.adapter.disconnect();
      dispatch(removeWalletConnection(this.connected));
    },
  }));
  const ledger = [
    {
      connectionType: WalletConnectionType.ledgerTron,
      icon: ledgerConnection.icon,
      name: ledgerConnection.name,
      get id() {
        return `${this.name}:${this.connectionType}`;
      },
      get connected() {
        return connectedWallets[this.id];
      },
      connect: () => ledgerConnection.connect(NetworkNames.tron),
      disconnect: ledgerConnection.disconnect.bind(ledgerConnection),
    },
    {
      connectionType: WalletConnectionType.ledgerSol,
      icon: ledgerConnection.icon,
      name: ledgerConnection.name,
      get id() {
        return `${this.name}:${this.connectionType}`;
      },
      get connected() {
        return connectedWallets[this.id];
      },
      connect: () => ledgerConnection.connect(NetworkNames.solana),
      disconnect: ledgerConnection.disconnect.bind(ledgerConnection),
    },
  ];
  const result = [
    ...eip6963wallets,
    ...solanaWallets,
    ...satsWallets,
    ...ledger,
  ];
  if (connectionType) {
    return result.filter((w) => connectionType.includes(w.connectionType));
  }
  return result;
}
