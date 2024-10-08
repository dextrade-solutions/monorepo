import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
// import { clusterApiUrl } from '@solana/web3.js';
import React, { useMemo } from 'react';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

export default function Web3SolanaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  const endpoint =
    'https://mainnet.helius-rpc.com/?api-key=d71a7e74-db9e-4341-940c-ba6e37adcac6';

  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/anza-xyz/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      // new UnsafeBurnerWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect localStorageKey="web3sol">
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
