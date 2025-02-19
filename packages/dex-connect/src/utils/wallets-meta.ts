import { isMobileWeb } from 'dex-helpers';

import { getTrustWalletProvider } from './get-trust-wallet-provider';

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
    name: 'dextrade wallet',
    icon: '/images/wallets/dextrade.svg',
    deepLink: `/dapp/open?url=`,
    onlyMobile: true,
  },
  {
    name: 'walletconnect',
    icon: '/images/wallets/wallet-connect.svg',
    supportMobileBrowser: true,
  },
  {
    name: 'xverse',
    icon: '/images/wallets/xverse.svg',
    // deepLink: 'https://xverse.app/dapp/',
    supportMobileBrowser: true,
  },
  {
    name: 'coinbase wallet',
    icon: '/images/wallets/coinbase.webp',
    supportMobileBrowser: true,
  },
  {
    name: 'multiversx wallet',
    icon: '/images/wallets/multiversx.webp',
    downloadLink: 'https://wallet.multiversx.com/',
  },
  {
    name: 'ledgerlive',
    icon: '/images/wallets/ledgerlive.webp',
  },
  {
    name: 'metamask',
    icon: `/images/wallets/metamask.png`,
    deepLink: 'https://metamask.app.link/dapp/',
    downloadLink: 'https://metamask.app.link/dapp/',
    get installed() {
      return isMetamaskInstalled();
    },
    get isWebView() {
      return (
        typeof navigator !== 'undefined' &&
        /WebView MetaMaskMobile/i.test(navigator.userAgent)
      );
    },
  },
  {
    name: 'trustwallet',
    icon: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTgiIGhlaWdodD0iNjUiIHZpZXdCb3g9IjAgMCA1OCA2NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgOS4zODk0OUwyOC44OTA3IDBWNjUuMDA0MkM4LjI1NDUgNTYuMzM2OSAwIDM5LjcyNDggMCAzMC4zMzUzVjkuMzg5NDlaIiBmaWxsPSIjMDUwMEZGIi8+CjxwYXRoIGQ9Ik01Ny43ODIyIDkuMzg5NDlMMjguODkxNSAwVjY1LjAwNDJDNDkuNTI3NyA1Ni4zMzY5IDU3Ljc4MjIgMzkuNzI0OCA1Ny43ODIyIDMwLjMzNTNWOS4zODk0OVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8yMjAxXzY5NDIpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMjIwMV82OTQyIiB4MT0iNTEuMzYxNSIgeTE9Ii00LjE1MjkzIiB4Mj0iMjkuNTM4NCIgeTI9IjY0LjUxNDciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjAyMTEyIiBzdG9wLWNvbG9yPSIjMDAwMEZGIi8+CjxzdG9wIG9mZnNldD0iMC4wNzYyNDIzIiBzdG9wLWNvbG9yPSIjMDA5NEZGIi8+CjxzdG9wIG9mZnNldD0iMC4xNjMwODkiIHN0b3AtY29sb3I9IiM0OEZGOTEiLz4KPHN0b3Agb2Zmc2V0PSIwLjQyMDA0OSIgc3RvcC1jb2xvcj0iIzAwOTRGRiIvPgo8c3RvcCBvZmZzZXQ9IjAuNjgyODg2IiBzdG9wLWNvbG9yPSIjMDAzOEZGIi8+CjxzdG9wIG9mZnNldD0iMC45MDI0NjUiIHN0b3AtY29sb3I9IiMwNTAwRkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K`,
    get installed() {
      return Boolean(getTrustWalletProvider());
    },
    deepLink: 'https://link.trustwallet.com/open_url?coin_id=20000714&url=',
    downloadLink: 'https://trustwallet.com/browser-extension',
    guide: {
      desktop: 'https://trustwallet.com/browser-extension',
      mobile: 'https://trustwallet.com/',
    },
    get isWebView() {
      return isMobileWeb && this.installed;
    },
  },
  {
    name: 'okx wallet',
    downloadLink: 'https://www.okx.com/download',
    deepLink:
      'https://www.okx.com/download?deeplink=okx%3A%2F%2Fwallet%2Fdapp%2Furl%3FdappUrl%3D',
    guide: {
      desktop: 'https://www.okx.com/web3',
      mobile: 'https://www.okx.com/web3',
    },
    get installed() {
      return typeof window !== 'undefined' && Boolean(window.okxwallet);
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
    deepLink: 'https://rabby.io/dapp?url=',
  },
  {
    name: 'phantom',
    get installed() {
      return '';
    },
    deepLink: 'https://phantom.app/ul/v1/connect?uri=',
  },
];
