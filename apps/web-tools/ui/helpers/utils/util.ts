export const getWalletIcon = (walletName: string) => {
  switch (walletName.toLowerCase()) {
    case 'walletconnect': {
      return '/images/wallets/wallet-connect.svg';
    }
    case 'xverse': {
      return '/images/wallets/xverse.svg';
    }
    case 'ledgerlive': {
      return '/images/wallets/ledgerlive.webp';
    }
    case 'coinbase wallet': {
      return '/images/wallets/coinbase.webp';
    }
    default: {
      return null;
    }
  }
};
