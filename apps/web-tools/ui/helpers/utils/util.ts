import { getWalletIcon as dexGetWalletIcon } from 'dex-connect';

export const getWalletIcon = (walletName: string) => {
  return dexGetWalletIcon(walletName);
};
