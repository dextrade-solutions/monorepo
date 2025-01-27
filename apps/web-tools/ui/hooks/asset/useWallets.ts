import { useConnections, WalletConnectionType } from 'dex-connect';
import { useConfig } from 'wagmi';

export function useWallets({
  connectionType,
  includeKeypairWallet,
}: {
  connectionType?: WalletConnectionType[];
  includeKeypairWallet?: boolean;
} = {}) {
  const config = useConfig();
  const { data: connections = [] } = useConnections({
    connectionType,
    wagmiConfig: config,
  });
  return connections;
}
