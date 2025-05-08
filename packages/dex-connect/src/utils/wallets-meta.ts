import { isMobileWeb } from 'dex-helpers';

import { getTrustWalletProvider } from './get-trust-wallet-provider';

function getBaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (error) {
    throw new Error('Invalid URL provided');
  }
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

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isRabby?: boolean;
    providers?: Array<{ isMetaMask: boolean }>;
  };
  btc_providers?: unknown;
  okxwallet?: unknown;
  phantom?: unknown;
  solflare?: unknown;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isRabby?: boolean;
      providers?: Array<{ isMetaMask: boolean }>;
    };
    btc_providers?: unknown;
    okxwallet?: unknown;
    phantom?: unknown;
    solflare?: unknown;
  }
}

export const DEXTRADE_WALLET = {
  name: 'dextrade wallet',
  displayName: 'Dextrade Wallet',
  icon: '/images/wallets/dextrade.svg',
  deepLink: `/dapp/open?url=`,
  onlyMobile: true,
  getInAppBrowse(url: string) {
    return `${this.deepLink}${url}`;
  },
};
export const WALLET_CONNECT = {
  name: 'walletconnect',
  displayName: 'WalletConnect',
  icon: '/images/wallets/wallet-connect.svg',
  supportMobileBrowser: true,
};
export const XVERSE = {
  name: 'xverse',
  displayName: 'Xverse',
  icon: '/images/wallets/xverse.svg',
  deepLink: 'https://connect.xverse.app/browser?url=',
  downloadLink: 'https://www.xverse.app/download',
  get installed() {
    return typeof window !== 'undefined' && Boolean(window.btc_providers);
  },
  get isWebView() {
    return isMobileWeb && this.installed;
  },
  getInAppBrowse(url: string) {
    return `${this.deepLink}${url}`;
  },
};
export const COINBASE = {
  name: 'coinbase wallet',
  displayName: 'Coinbase Wallet',
  icon: '/images/wallets/coinbase.webp',
  supportMobileBrowser: true,
};
export const MULTIVERSE = {
  name: 'multiversx wallet',
  displayName: 'MultiversX Wallet',
  icon: '/images/wallets/multiversx.webp',
  downloadLink: 'https://wallet.multiversx.com/',
  getInAppBrowse(url: string) {
    return `https://maiar.com/dapp/${url}`;
  },
};
export const LEDGER = {
  name: 'ledgerlive',
  displayName: 'Ledger Live',
  icon: '/images/wallets/ledgerlive.webp',
  getInAppBrowse(url: string) {
    return `ledgerlive://dapp/open?url=${url}`;
  },
};
export const METAMASK = {
  name: 'metamask',
  displayName: 'MetaMask',
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
  getInAppBrowse(url: string) {
    return `${this.deepLink}${url}`;
  },
};
export const TRUSTWALLET = {
  name: 'trustwallet',
  displayName: 'Trust Wallet',
  icon: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTgiIGhlaWdodD0iNjUiIHZpZXdCb3g9IjAgMCA1OCA2NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgOS4zODk0OUwyOC44OTA3IDBWNjUuMDA0MkM4LjI1NDUgNTYuMzM2OSAwIDM5LjcyNDggMCAzMC4zMzUzVjkuMzg5NDlaIiBmaWxsPSIjMDUwMEZGIi8+CjxwYXRoIGQ9Ik01Ny43ODIyIDkuMzg5NDlMMjguODkxNSAwVjY1LjAwNDJDNDkuNTI3NyA1Ni4zMzY5IDU3Ljc4MjIgMzkuNzI0OCA1Ny43ODIyIDMwLjMzNTNWOS4zODk0OVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8yMjAxXzY5NDIpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMjIwMV82OTQyIiB4MT0iNTEuMzYxNSIgeTE9Ii00LjE1MjkzIiB4Mj0iMjkuNTM4NCIgeTI9IjY0LjUxNDciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjAyMTEyIiBzdG9wLWNvbG9yPSIjMDAwMEZGIi8+CjxzdG9wIG9mZnNldD0iMC4wNzYyNDIzIiBzdG9wLWNvbG9yPSIjMDA5NEZGIi8+CjxzdG9wIG9mZnNldD0iMC4xNjMwODkiIHN0b3AtY29sb3I9IiM0OEZGOTEiLz4KPHN0b3Agb2Zmc2V0PSIwLjQyMDA0OSIgc3RvcC1jb2xvcj0iIzAwOTRGRiIvPgo8c3RvcCBvZmZzZXQ9IjAuNjgyODg2IiBzdG9wLWNvbG9yPSIjMDAzOEZGIi8+CjxzdG9wIG9mZnNldD0iMC45MDI0NjUiIHN0b3AtY29sb3I9IiMwNTAwRkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K`,
  get installed() {
    return Boolean(getTrustWalletProvider());
  },
  deepLink: 'https://link.trustwallet.com/open_url?url=',
  downloadLink: 'https://trustwallet.com/browser-extension',
  guide: {
    desktop: 'https://trustwallet.com/browser-extension',
    mobile: 'https://trustwallet.com/',
  },
  get isWebView() {
    return isMobileWeb && this.installed;
  },
  getInAppBrowse(url: string) {
    return `${this.deepLink}${url}`;
  },
};
export const OKX = {
  name: 'okx wallet',
  displayName: 'OKX Wallet',
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
  getInAppBrowse(url: string) {
    return `${this.deepLink}${url}`;
  },
};
export const RABBY_WALLET = {
  name: 'rabby wallet',
  displayName: 'Rabby Wallet',
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
  getInAppBrowse(url: string) {
    return `${this.deepLink}${url}`;
  },
};
export const PHANTOM = {
  name: 'phantom',
  displayName: 'Phantom',
  icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiB2aWV3Qm94PSIwIDAgMTA4IDEwOCIgZmlsbD0ibm9uZSI+CjxyZWN0IHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiByeD0iMjYiIGZpbGw9IiNBQjlGRjIiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00Ni41MjY3IDY5LjkyMjlDNDIuMDA1NCA3Ni44NTA5IDM0LjQyOTIgODUuNjE4MiAyNC4zNDggODUuNjE4MkMxOS41ODI0IDg1LjYxODIgMTUgODMuNjU2MyAxNSA3NS4xMzQyQzE1IDUzLjQzMDUgNDQuNjMyNiAxOS44MzI3IDcyLjEyNjggMTkuODMyN0M4Ny43NjggMTkuODMyNyA5NCAzMC42ODQ2IDk0IDQzLjAwNzlDOTQgNTguODI1OCA4My43MzU1IDc2LjkxMjIgNzMuNTMyMSA3Ni45MTIyQzcwLjI5MzkgNzYuOTEyMiA2OC43MDUzIDc1LjEzNDIgNjguNzA1MyA3Mi4zMTRDNjguNzA1MyA3MS41NzgzIDY4LjgyNzUgNzAuNzgxMiA2OS4wNzE5IDY5LjkyMjlDNjUuNTg5MyA3NS44Njk5IDU4Ljg2ODUgODEuMzg3OCA1Mi41NzU0IDgxLjM4NzhDNDcuOTkzIDgxLjM4NzggNDUuNjcxMyA3OC41MDYzIDQ1LjY3MTMgNzQuNDU5OEM0NS42NzEzIDcyLjk4ODQgNDUuOTc2OCA3MS40NTU2IDQ2LjUyNjcgNjkuOTIyOVpNODMuNjc2MSA0Mi41Nzk0QzgzLjY3NjEgNDYuMTcwNCA4MS41NTc1IDQ3Ljk2NTggNzkuMTg3NSA0Ny45NjU4Qzc2Ljc4MTYgNDcuOTY1OCA3NC42OTg5IDQ2LjE3MDQgNzQuNjk4OSA0Mi41Nzk0Qzc0LjY5ODkgMzguOTg4NSA3Ni43ODE2IDM3LjE5MzEgNzkuMTg3NSAzNy4xOTMxQzgxLjU1NzUgMzcuMTkzMSA4My42NzYxIDM4Ljk4ODUgODMuNjc2MSA0Mi41Nzk0Wk03MC4yMTAzIDQyLjU3OTVDNzAuMjEwMyA0Ni4xNzA0IDY4LjA5MTYgNDcuOTY1OCA2NS43MjE2IDQ3Ljk2NThDNjMuMzE1NyA0Ny45NjU4IDYxLjIzMyA0Ni4xNzA0IDYxLjIzMyA0Mi41Nzk1QzYxLjIzMyAzOC45ODg1IDYzLjMxNTcgMzcuMTkzMSA2NS43MjE2IDM3LjE5MzFDNjguMDkxNiAzNy4xOTMxIDcwLjIxMDMgMzguOTg4NSA3MC4yMTAzIDQyLjU3OTVaIiBmaWxsPSIjRkZGREY4Ii8+Cjwvc3ZnPg==',
  get installed() {
    return (
      typeof window !== 'undefined' &&
      (window.navigator.userAgent.includes('Phantom') || window.phantom)
    );
  },
  get isWebView() {
    return (
      typeof navigator !== 'undefined' && /Phantom/i.test(navigator.userAgent)
    );
  },
  getInAppBrowse(url: string) {
    const baseUrl = 'https://phantom.app/ul/browse/';
    const encodedUrl = encodeURIComponent(url);
    const refParam = `?ref=${encodeURIComponent(getBaseUrl(url))}`;
    return `${baseUrl}${encodedUrl}${refParam}`;
  },
};
export const SOLFLARE = {
  name: 'solflare',
  displayName: 'Solflare',
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJTIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMwMjA1MGE7c3Ryb2tlOiNmZmVmNDY7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOi41cHg7fS5jbHMtMntmaWxsOiNmZmVmNDY7fTwvc3R5bGU+PC9kZWZzPjxyZWN0IGNsYXNzPSJjbHMtMiIgeD0iMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMTIiIHJ5PSIxMiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTI0LjIzLDI2LjQybDIuNDYtMi4zOCw0LjU5LDEuNWMzLjAxLDEsNC41MSwyLjg0LDQuNTEsNS40MywwLDEuOTYtLjc1LDMuMjYtMi4yNSw0LjkzbC0uNDYuNS4xNy0xLjE3Yy42Ny00LjI2LS41OC02LjA5LTQuNzItNy40M2wtNC4zLTEuMzhoMFpNMTguMDUsMTEuODVsMTIuNTIsNC4xNy0yLjcxLDIuNTktNi41MS0yLjE3Yy0yLjI1LS43NS0zLjAxLTEuOTYtMy4zLTQuNTF2LS4wOGgwWk0xNy4zLDMzLjA2bDIuODQtMi43MSw1LjM0LDEuNzVjMi44LjkyLDMuNzYsMi4xMywzLjQ2LDUuMThsLTExLjY1LTQuMjJoMFpNMTMuNzEsMjAuOTVjMC0uNzkuNDItMS41NCwxLjEzLTIuMTcuNzUsMS4wOSwyLjA1LDIuMDUsNC4wOSwyLjcxbDQuNDIsMS40Ni0yLjQ2LDIuMzgtNC4zNC0xLjQyYy0yLS42Ny0yLjg0LTEuNjctMi44NC0yLjk2TTI2LjgyLDQyLjg3YzkuMTgtNi4wOSwxNC4xMS0xMC4yMywxNC4xMS0xNS4zMiwwLTMuMzgtMi01LjI2LTYuNDMtNi43MmwtMy4zNC0xLjEzLDkuMTQtOC43Ny0xLjg0LTEuOTYtMi43MSwyLjM4LTEyLjgxLTQuMjJjLTMuOTcsMS4yOS04Ljk3LDUuMDktOC45Nyw4Ljg5LDAsLjQyLjA0LjgzLjE3LDEuMjktMy4zLDEuODgtNC42MywzLjYzLTQuNjMsNS44LDAsMi4wNSwxLjA5LDQuMDksNC41NSw1LjIybDIuNzUuOTItOS41Miw5LjE0LDEuODQsMS45NiwyLjk2LTIuNzEsMTQuNzMsNS4yMmgwWiIvPjwvc3ZnPg==',
  get installed() {
    return typeof window !== 'undefined' && Boolean(window.solflare);
  },
  get isWebView() {
    return (
      typeof navigator !== 'undefined' &&
      /Solflare-Mobile/i.test(navigator.userAgent)
    );
  },
  getInAppBrowse(url: string) {
    const baseUrl = 'https://solflare.com/ul/v1/browse/';
    const encodedUrl = encodeURIComponent(url);
    const refParam = `?ref=${encodeURIComponent(getBaseUrl(url))}`;
    return `${baseUrl}${encodedUrl}${refParam}`;
  },
};

export const WALLETS_META = [
  DEXTRADE_WALLET,
  WALLET_CONNECT,
  XVERSE,
  COINBASE,
  MULTIVERSE,
  LEDGER,
  METAMASK,
  TRUSTWALLET,
  OKX,
  RABBY_WALLET,
  PHANTOM,
  SOLFLARE,
];
