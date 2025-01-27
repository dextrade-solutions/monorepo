import { WalletConnectionType } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';

export type TxParams = {
  asset: AssetModel;
  recipient: string;
  amount: number | string;
};

export interface ConnectionProvider {
  type: WalletConnectionType;

  icon?: string;

  name: string;

  isAuthorized(): Promise<boolean> | boolean;

  connect(): Promise<string>;

  disconnect(): Promise<void>;

  signMessage(message: string): Promise<string>;

  txSend(params: TxParams): Promise<string>; // returns tx hash
}
