import { UseQueryResult } from '@tanstack/react-query';
import { AssetModel } from 'dex-helpers/types';
import EventEmitter from 'events';

import { WalletConnectionType } from './constants';
import { WALLETS_META } from './utils';

export interface TxSendParams {
  asset: AssetModel;
  recipient: string;
  amount: number;
  txSentHandlers?: {
    onSuccess: (txHash: string) => void;
    onError: (e: unknown) => void;
  };
}

export interface WalletConnection {
  connectionType: WalletConnectionType;
  walletName: string;
  address: string;
}

export interface Connection {
  id: string;
  meta?: (typeof WALLETS_META)[number];
  connectionType: WalletConnectionType;
  icon?: string;
  name: string;
  connected: WalletConnection;
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  signMessage(message: string): Promise<string>;
  txSend(params: TxSendParams): Promise<string>;
}

export interface ConnectionHub extends EventEmitter {
  on(event: 'connection:start', listener: (id: string) => void): this;
  on(
    event: 'connection:success',
    listener: (walletConnection: WalletConnection) => void,
  ): this;
  on(
    event: 'disconnected',
    listener: (walletConnection: WalletConnection) => void,
  ): this;
  emit(event: 'connection:start', id: string): boolean;
  emit(
    event: 'connection:success',
    walletConnection: WalletConnection,
  ): boolean;
  emit(event: 'disconnected', walletConnection: WalletConnection): boolean;
}

export interface UseConnectionsResult {
  connections: UseQueryResult<Connection[], unknown>;
  hub: ConnectionHub;
}
