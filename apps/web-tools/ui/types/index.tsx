import { WalletConnectionType } from '../helpers/constants/wallets';

export type WalletConnection = {
  walletName: string;
  connectionType: WalletConnectionType;
  address: string;
};
