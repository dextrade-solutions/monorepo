import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from 'react';

// export const UserContext = React.createContext(null);

// Define the storeProvider as a React hook
export const useConnectionState = () => {
  const [walletConnections, setWalletConnections] = useLocalStorage(
    'dex-connect',
    {},
  );
  const isConnected = (id: string) => {
    return walletConnections[id];
  };

  const addWalletConnection = (walletConnection) => {
    const id = `${walletConnection.walletName}:${walletConnection.connectionType}`;
    setWalletConnections((prev) => {
      return { ...prev, [id]: { ...walletConnection, connected: true } };
    });
  };

  const removeWalletConnection = (id: string) => {
    setWalletConnections((prev) => {
      const updated = prev;
      delete updated[id];
      return updated;
    });
  };

  const setConnected = (id: string, status) => {
    setWalletConnections((prev) => {
      const updated = new Map(prev);
      const wallet = updated.get(id);
      if (wallet) {
        updated.set(id, { ...wallet, connected: status });
      }
      return updated;
    });
  };

  return {
    isConnected,
    addWalletConnection,
    removeWalletConnection,
    setConnected,
    walletConnections, // expose for reading full state
  };
};
