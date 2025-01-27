import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import React from 'react';
import { WagmiProvider } from 'wagmi';

export default function DexConnectProvider({
  wagmiConfig,
  solanaConfig,
  children,
}: {
  wagmiConfig: any;
  solanaConfig: any;
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <ConnectionProvider endpoint={solanaConfig.SOLANA_CONNECT_API}>
        <WalletProvider
          wallets={solanaConfig.SOLANA_CONNECT_WALLETS}
          autoConnect
          localStorageKey="web3sol"
        >
          {children}
        </WalletProvider>
      </ConnectionProvider>
    </WagmiProvider>
  );
}
