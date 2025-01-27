import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// import { clusterApiUrl } from '@solana/web3.js';
import React from 'react';

import {
  SOLANA_CONNECT_API,
  SOLANA_CONNECT_WALLETS,
} from '../../../../app/helpers/solana-config';

export default function Web3SolanaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const network = WalletAdapterNetwork.Mainnet;

  return (
    <ConnectionProvider endpoint={SOLANA_CONNECT_API}>
      <WalletProvider
        wallets={SOLANA_CONNECT_WALLETS}
        autoConnect
        localStorageKey="web3sol"
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
