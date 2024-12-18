import { createClient } from 'viem';
import { createConfig, http } from 'wagmi';
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  mainnet as defaultMainnet,
  sepolia,
  xdc as defaultXdc,
} from 'wagmi/chains';
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '1ee56a25a2dad471b92feb59898b7aa6';

// // 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const mainnet = {
  ...defaultMainnet,
  rpcUrls: {
    default: {
      http: ['https://eth.llamarpc.com'],
    },
  },
};

const xdc = {
  ...defaultXdc,
  contracts: {},
};

const chains = [mainnet, arbitrum, bsc, avalanche, base, sepolia, xdc] as const;

const WC_PARAMS = {
  projectId,
  qrModalOptions: {
    themeVariables: {
      '--wcm-font-family': '"Open-sans", sans-serif',
      '--wcm-z-index': '10000',
    },
  },
};

export const config = createConfig({
  chains,
  metadata,
  connectors: [
    walletConnect({
      ...WC_PARAMS,
    }),
    coinbaseWallet({
      appName: 'Dextrade',
      // CB SDK doesn't pass the parent origin context to their passkey site
      // Flagged to CB team and can remove UNISWAP_WEB_URL once fixed
      appLogoUrl: `https://p2p.dextrade.com/images/dextrade-full.svg`,
      reloadOnDisconnect: false,
      enableMobileWalletLink: true,
    }),
  ],
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

// createWeb3Modal({
//   wagmiConfig: config,
//   projectId,
//   enableAnalytics: true, // Optional - defaults to your Cloud configuration
//   enableOnramp: true, // Optional - false as default
// });

// // 2. Create a metadata object - optional
// const metadata = {
//   name: 'AppKit',
//   description: 'AppKit Example',
//   url: 'https://example.com', // origin must match your domain & subdomain
//   icons: ['https://avatars.githubusercontent.com/u/179229932'],
// };

// // 3. Set the networks
// const networks = [mainnet, arbitrum, bsc, avalanche, base, sepolia, xdc, solana];

// // 0. Set up Solana Adapter
// export const solanaWeb3JsAdapter = new SolanaAdapter({
//   wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
// });

// // const connectors: CreateConnectorFn[] = []
// // connectors.push(walletConnect({ projectId, metadata, showQrModal: false })) // showQrModal must be false
// // connectors.push(injected({ shimDisconnect: true }))
// // connectors.push(
// //   coinbaseWallet({
// //     appName: metadata.name,
// //     appLogoUrl: metadata.icons[0]
// //   })
// // );

// // 4. Create Wagmi Adapter
// export const wagmiAdapter = new WagmiAdapter({
//   networks: chains,
//   projectId,
// });

// // 5. Create modal
// createAppKit({
//   adapters: [wagmiAdapter],
//   networks: chains,
//   projectId,
//   metadata,
//   features: {
//     analytics: true, // Optional - defaults to your Cloud configuration
//   },
// });
