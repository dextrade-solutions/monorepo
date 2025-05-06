import { createAppKit } from '@reown/appkit';
// import { mainnet, arbitrum, base, polygon, bsc } from '@reown/appkit/networks';
// import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter, authConnector } from '@reown/appkit-adapter-wagmi';
import { createClient } from 'viem';
import { createConfig, http, CreateConnectorFn } from 'wagmi';
import {
  arbitrum,
  avalanche,
  base,
  bsc as defaultBsc,
  mainnet as defaultMainnet,
  sepolia,
  xdc as defaultXdc,
} from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';

import { walletConnect as customWalletConnect } from '../../ui/helpers/utils/wc-connector-v2';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '1ee56a25a2dad471b92feb59898b7aa6';

// 2. Create metadata object
export const metadata = {
  name: 'Dextrade',
  description: 'Dextrade - Decentralized Exchange',
  url: 'https://p2p.dextrade.com',
  icons: ['https://p2p.dextrade.com/images/dextrade-full.svg'],
};

const mainnet = {
  ...defaultMainnet,
  rpcUrls: {
    default: {
      http: ['https://eth.llamarpc.com'],
    },
  },
};
const bsc = {
  ...defaultBsc,
  rpcUrls: {
    default: {
      http: ['https://bsc-dataseed1.binance.org'],
    },
  },
};

const xdc = {
  ...defaultXdc,
  contracts: {},
};

const networks = [
  mainnet,
  arbitrum,
  bsc,
  avalanche,
  base,
  sepolia,
  xdc,
] as const;

export const WC_PARAMS = {
  projectId,
  qrModalOptions: {
    themeVariables: {
      '--wcm-font-family': '"Open-sans", sans-serif',
      '--wcm-z-index': '1000',
    },
  },
};

// 4. Set up networks
// export const networks = [mainnet, arbitrum, base, polygon];

// 5. Create Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

// 7. Create AppKit instance
const appkit = createAppKit({
  // adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  features: {
    analytics: true,
  },
  themeVariables: {
    '--w3m-z-index': '1000',
  },
});

const connectors: CreateConnectorFn[] = [
  metaMask(),
  customWalletConnect(
    {
      projectId,
      networks,
    },
    appkit,
  ),
  coinbaseWallet({
    appName: metadata.name,
    appLogoUrl: metadata.icons[0],
    reloadOnDisconnect: false,
    enableMobileWalletLink: true,
  }),
];

export const config = createConfig({
  chains: networks,
  metadata,
  connectors,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});
