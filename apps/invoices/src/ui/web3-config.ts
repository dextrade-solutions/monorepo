import {
  trustWalletConnect,
  walletConnect,
  WC_METADATA,
  WC_PARAMS,
} from 'dex-connect';
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
import { coinbaseWallet, metaMask } from 'wagmi/connectors';

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

export const config = createConfig({
  chains,
  metadata: WC_METADATA,
  connectors: [
    metaMask(),
    trustWalletConnect(),
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
