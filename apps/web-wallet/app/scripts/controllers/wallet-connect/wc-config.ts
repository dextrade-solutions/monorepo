export const METHODS_TO_REDIRECT: { [method: string]: boolean } = {
  eth_requestAccounts: true,
  eth_sendTransaction: true,
  eth_signTransaction: true,
  eth_sign: true,
  personal_sign: true,
  eth_signTypedData: true,
  eth_signTypedData_v3: true,
  eth_signTypedData_v4: true,
  wallet_watchAsset: true,
  wallet_addEthereumChain: true,
  wallet_switchEthereumChain: true,
};

export const CLIENT_OPTIONS = {
  clientMeta: {
    // Required
    description: 'MetaMask Mobile app',
    url: 'https://metamask.io',
    icons: [],
    name: 'MetaMask',
    ssl: true,
  },
};

export const WALLET_CONNECT = {
  // One day in hours
  SESSION_LIFETIME: 24,
  LIMIT_SESSIONS: 20,
  DEEPLINK_SESSIONS: 'wc2sessions_deeplink',
  PROJECT_ID: '1ee56a25a2dad471b92feb59898b7aa6',
  METADATA: {
    name: 'MetaMask Wallet',
    description: 'MetaMask Wallet Integration',
    url: 'https://metamask.io/',
    icons: [],
    redirect: {
      native: 'metamask://',
      universal: 'https://metamask.app.link/',
    },
  },
};

export const WALLET_CONNECT_ORIGIN = 'wc::';

export const DEEPLINKS = {
  ORIGIN_DEEPLINK: 'deeplink',
  ORIGIN_QR_CODE: 'qr-code',
};
