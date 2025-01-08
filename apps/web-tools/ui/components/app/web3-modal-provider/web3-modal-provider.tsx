// import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'dex-helpers/shared';
import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

import { config } from '../../../../app/helpers/web3-client-configuration';

interface IProps {
  children: ReactNode;
}
// const query = new QueryClient();
// const persister = createSyncStoragePersister({
//   storage: window.localStorage,
// });

export const Web3ModalProvider: React.FC<IProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
