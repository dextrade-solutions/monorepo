import { DexConnectProvider } from 'dex-connect';

import InvoiceView from './InvoiceView';

type SolanaConfig = {
  SOLANA_CONNECT_API: string;
  SOLANA_CONNECT_WALLETS: any[];
};

export default function Invoice({
  wagmiConfig,
  solana,
  id,
  onBack,
}: {
  wagmiConfig: any;
  solana: SolanaConfig;
  id: string;
  onBack?: () => void;
}) {
  return (
    <DexConnectProvider wagmiConfig={wagmiConfig} solanaConfig={solana}>
      <InvoiceView id={id} onBack={onBack} />
    </DexConnectProvider>
  );
}
