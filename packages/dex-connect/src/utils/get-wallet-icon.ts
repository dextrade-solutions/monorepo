import { WALLETS_META } from './wallets-meta';

export const getWalletIcon = (walletName: string) => {
  const walletMeta = WALLETS_META.find(
    ({ name }) => name.toLowerCase() === walletName.toLowerCase(),
  );
  return walletMeta?.icon;
};
