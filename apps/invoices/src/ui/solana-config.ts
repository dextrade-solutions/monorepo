import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// You can also provide a custom RPC endpoint.
export const SOLANA_CONNECT_API =
  'https://mainnet.helius-rpc.com/?api-key=d71a7e74-db9e-4341-940c-ba6e37adcac6';

export const SOLANA_CONNECT_WALLETS = [
  new SolflareWalletAdapter(),
  new TrustWalletAdapter(),
  new PhantomWalletAdapter(),
];
