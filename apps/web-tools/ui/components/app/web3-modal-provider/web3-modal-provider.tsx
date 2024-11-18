import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

import engine from '../../../../app/engine';
import { config } from '../../../../app/helpers/web3-client-configuration';

interface IProps {
  children: ReactNode;
}

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

export const Web3ModalProvider: React.FC<IProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={engine.queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
