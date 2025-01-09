export function getTrustWalletProvider(): any | undefined {
  const isTrustWallet = (ethereum: NonNullable<Window['ethereum']>) => {
    // Identify if Trust Wallet injected provider is present.
    const trustWallet = Boolean(ethereum.isTrust);

    return trustWallet;
  };

  const injectedProviderExist =
    typeof window !== 'undefined' &&
    window !== null &&
    typeof window.ethereum !== 'undefined' &&
    window.ethereum !== null;

  // No injected providers exist.
  if (!injectedProviderExist) {
    return;
  }

  // Trust Wallet was injected into window.ethereum.
  if (isTrustWallet(window.ethereum as NonNullable<Window['ethereum']>)) {
    return window.ethereum;
  }

  let trustWalletProvider;

  if (window.ethereum?.providers?.length) {
    // Trust Wallet provider might be replaced by another
    // injected provider, check the providers array.
    trustWalletProvider = window.ethereum.providers.find(
      (provider: any) => provider && isTrustWallet(provider),
    );
  }

  if (!trustWalletProvider) {
    // In some cases injected providers can replace window.ethereum
    // without updating the providers array. In those instances the Trust Wallet
    // can be installed and its provider instance can be retrieved by
    // looking at the global `trustwallet` object.
    trustWalletProvider = window.trustwallet;
  }

  return trustWalletProvider;
}
const isMetamaskInstalled = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (window.ethereum?.isMetaMask) {
    return true;
  }

  if (window.ethereum?.providers?.some((p) => p.isMetaMask)) {
    return true;
  }

  return false;
};

export const WALLETS_META = [
  {
    name: 'walletconnect',
    icon: '/images/wallets/wallet-connect.svg',
  },
  {
    name: 'xverse',
    icon: '/images/wallets/xverse.svg',
  },
  {
    name: 'coinbase wallet',
    icon: '/images/wallets/coinbase.webp',
  },
  {
    name: 'multiversx wallet',
    icon: '/images/wallets/multiversx.webp',
  },
  {
    name: 'ledgerlive',
    icon: '/images/wallets/ledgerlive.webp',
  },
  {
    name: 'metamask',
    icon: `/images/wallets/metamask.png`,
    get installed() {
      return isMetamaskInstalled();
    },
    deepLink: 'https://metamask.app.link/dapp/p2p.dextrade.com/',
    downloadLink: 'https://metamask.app.link/dapp/p2p.dextrade.com/',
  },
  {
    name: 'trust wallet',
    icon: `/images/wallets/trust.svg`,
    get installed() {
      return Boolean(getTrustWalletProvider());
    },
    deepLink:
      'https://link.trustwallet.com/open_url?coin_id=20000714&url=https://p2p.dextrade.com/',
    downloadLink: 'https://trustwallet.com/browser-extension',
    guide: {
      desktop: 'https://trustwallet.com/browser-extension',
      mobile: 'https://trustwallet.com/',
    },
  },
  {
    name: 'okx wallet',
    get installed() {
      return typeof window !== 'undefined' && Boolean(window.okxwallet);
    },
    downloadLink: 'https://www.okx.com/download',
    deepLink:
      'https://www.okx.com/download?deeplink=okx%3A%2F%2Fwallet%2Fdapp%2Furl%3FdappUrl%3Dhttps%253A%252F%252Fp2p.dextrade.com',
    guide: {
      desktop: 'https://www.okx.com/web3',
      mobile: 'https://www.okx.com/web3',
    },
  },
  {
    name: 'rabby wallet',
    icon: `/images/wallets/rabby.svg`,
    get installed() {
      return typeof window !== 'undefined' && Boolean(window.ethereum?.isRabby);
    },
    guide: {
      desktop: 'https://rabby.io/',
    },
    downloadLink: {
      desktop: 'https://rabby.io/',
    },
  },
];
