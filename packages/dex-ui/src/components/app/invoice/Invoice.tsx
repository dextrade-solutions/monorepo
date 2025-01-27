// import {
//   ConnectionProvider,
//   WalletProvider,
// } from '@solana/wallet-adapter-react';
import { DexConnectProvider } from 'dex-connect';
// import { WagmiProvider } from 'wagmi';

import InvoiceView from './InvoiceView';

type SolanaConfig = {
  SOLANA_CONNECT_API: string;
  SOLANA_CONNECT_WALLETS: any[];
};

export default function Invoice({
  wagmiConfig,
  solana,
}: {
  wagmiConfig: any;
  solana: SolanaConfig;
}) {
  return (
    <DexConnectProvider wagmiConfig={wagmiConfig} solanaConfig={solana}>
      <InvoiceView />
    </DexConnectProvider>
  );
}
