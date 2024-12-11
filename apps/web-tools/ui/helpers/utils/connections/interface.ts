import { WalletConnectionType } from '../../constants/wallets';

export type TxParams = {
  sender: string;
  recipient: string;
  value: string;
  contractAddress?: string;
};

export interface ConnectionProvider {
  type: WalletConnectionType;

  name: string;

  isConnected: boolean;

  connect(): Promise<string>;

  disconnect(): Promise<void>;

  txSend(params: TxParams): Promise<string>; // returns tx hash
}
