import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useConnectors } from 'wagmi';

import { getAuth } from '../ducks/auth';

// Auth wallet
export function useAuthWallet() {
  const connectors = useConnectors();
  const authData = useSelector(getAuth);
  const usedConnector = connectors.find((i) => i.name === authData.wallet);
  const { apikey } = authData;

  const updAuth = async () => {
    if (usedConnector) {
      const [firstAddress] = await usedConnector.getAccounts();
      const isAuthorized = await usedConnector.isAuthorized();

      return {
        address: firstAddress,
        isConnected: Boolean(apikey && isAuthorized),
      };
    }
    return null;
  };

  const { data, refetch } = useQuery({
    queryKey: ['authenticatedUser'],
    queryFn: updAuth,
  });

  useEffect(() => {
    refetch();
  }, [authData, refetch]);

  return {
    isConnected: data?.isConnected,
    address: data?.address,
    walletInfo: usedConnector,
  };
}
