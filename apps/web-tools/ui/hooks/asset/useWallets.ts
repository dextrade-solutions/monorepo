import { useWallet } from '@solana/wallet-adapter-react';
import { isMetamaskWebView, NetworkNames } from 'dex-helpers';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Wallet, { AddressPurpose } from 'sats-connect';

import {
  getWalletConnections,
  removeWalletConnection,
  setWalletConnection,
} from '../../ducks/app/app';
import { WalletConnectionType } from '../../helpers/constants/wallets';
import keypairWalletConnection from '../../helpers/utils/connections/keypair';
import ledgerWalletConnection from '../../helpers/utils/connections/ledger';
import multiversxWalletConnection from '../../helpers/utils/connections/multiversx';
import { getWalletIcon } from '../../helpers/utils/util';
import { WALLETS_META } from '../../helpers/utils/wallets-meta';
import { WalletConnection } from '../../types';
import useConnection from '../wallets/useConnection';
import useEVMConnections from '../wallets/useEVMConnections';
import useTronConnection from '../wallets/useTronConnections';

export type WalletItem = {
  icon?: string;
  name: string;
  connected: WalletConnection | null;
  connect: () => Promise<WalletConnection>;
  disconnect: () => Promise<void>;
  metadata?: any;
};

export function useWallets({
  connectionType,
}: { connectionType?: WalletConnectionType[] } = {}) {
  const { wallets, select } = useWallet();
  const dispatch = useDispatch();
  const keypairConnection = useConnection(keypairWalletConnection);
  const multiversxConnection = useConnection(multiversxWalletConnection);
  const ledgerConnection = useConnection(ledgerWalletConnection);

  const connectedWallets = useSelector(getWalletConnections);

  const eip6963wallets = useEVMConnections();
  const tronWallets = useTronConnection();

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
    async connect() {
      select(item.adapter.name);
      await item.adapter.connect();
      const address = item.adapter.publicKey?.toBase58();
      if (!address) {
        throw new Error('connect solana wallet - something is wrong');
      }

      const walletConnection = {
        connectionType: this.connectionType,
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
  let result = [
    // wcTronConnection,
    // wcEvmConnection,
    ...eip6963wallets,
    ...solanaWallets,
    ...satsWallets,
    ...ledger,
    ...tronWallets,
    multiversxConnection,
    keypairConnection,
  ];
  if (connectionType) {
    result = result.filter((w) => connectionType.includes(w.connectionType));
  }
  if (isMetamaskWebView) {
    result = result.filter((w) => w.name.toLowerCase() === 'metamask');
  }
  return result.map((w) => ({
    ...w,
    metadata: WALLETS_META.find(
      ({ name }) => name.toLowerCase() === w.name.toLowerCase(),
    ),
  }));
}
