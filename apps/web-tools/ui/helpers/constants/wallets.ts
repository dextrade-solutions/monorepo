import { NetworkNames } from 'dex-helpers';

import { WalletConnectionType } from 'dex-connect';

export { WalletConnectionType } from 'dex-connect';

export const NETOWORK_BY_CONNECTION_TYPE = {
  [NetworkNames.bitcoin]: [
    WalletConnectionType.sats,
    WalletConnectionType.ledgerBtc,
  ],
  [NetworkNames.binance]: [WalletConnectionType.eip6963],
  [NetworkNames.ethereum]: [WalletConnectionType.eip6963],
  [NetworkNames.tron]: [
    WalletConnectionType.tronlink,
    WalletConnectionType.ledgerTron,
  ],
};

// if it will be growing, we can use assetList and make alias network to connectionTypes list
export const PAYMENT_ASSETS = [
  {
    chainId: null,
    contract: null,
    name: 'Bitcoin',
    decimals: 8,
    symbol: 'BTC',
    uid: 'bitcoin',
    network: 'bitcoin',
    isFiat: false,
    isNative: true,
  },
  {
    chainId: 56,
    contract: null,
    name: 'BNB Smart Chain',
    decimals: 18,
    symbol: 'BNB',
    uid: 'binancecoin',
    network: 'binance_smart_chain',
    isFiat: false,
    isNative: true,
  },
  {
    chainId: 1,
    contract: null,
    name: 'Ethereum',
    decimals: 18,
    symbol: 'ETH',
    uid: 'ethereum',
    network: 'ethereum',
    isFiat: false,
    isNative: true,
    weight: 3,
  },
  {
    chainId: 1,
    contract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    name: 'Tether',
    symbol: 'USDT',
    decimals: 6,
    uid: 'tether',
    network: 'ethereum',
    standard: 'erc20',
    isFiat: false,
    isNative: false,
  },
  {
    chainId: 56,
    contract: '0x55d398326f99059ff775485246999027b3197955',
    name: 'Tether',
    symbol: 'USDT',
    decimals: 18,
    uid: 'tether',
    network: 'binance_smart_chain',
    standard: 'bep20',
    isFiat: false,
    isNative: false,
  },
  {
    chainId: null,
    contract: null,
    name: 'Tron',
    decimals: 6,
    symbol: 'TRX',
    uid: 'tron',
    network: 'tron',
    isFiat: false,
    isNative: true,
  },
  {
    chainId: null,
    contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    name: 'Tether',
    symbol: 'USDT',
    decimals: 6,
    uid: 'tether',
    network: 'tron',
    standard: 'TRC20',
    isFiat: false,
    isNative: false,
  },
];
