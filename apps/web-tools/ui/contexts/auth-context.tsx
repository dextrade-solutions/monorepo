import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { AWAITING_SWAP_ROUTE } from '../helpers/constants/routes';
import { useTradesActive } from '../queries/useTradesActive';

// Define the type for the context value
interface UserAuthContextValue {
  tradesActive: boolean;
}

// Create the context with a default value
const UserAuthContext = createContext<UserAuthContextValue>({
  tradesActive: false, // Default to false if no provider is found
});

// Context provider component
interface UserAuthProviderProps {
  children: React.ReactNode;
}

// Custom hook to access the context
export const useAuth = () => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a UserAuthProvider');
  }
  return context;
};

export const UserAuthProvider: React.FC<UserAuthProviderProps> = ({
  children,
}) => {
  const tradesActive = useTradesActive();
  const navigate = useNavigate();

  useEffect(() => {
    if (tradesActive.data && tradesActive.data.length > 0) {
      navigate(`${AWAITING_SWAP_ROUTE}/${tradesActive.data[0].id}`);
    }
  }, [tradesActive.data]);

  const contextValue = useMemo<UserAuthContextValue>(
    () => ({
      tradesActive,
    }),
    [tradesActive],
  );

  return (
    <UserAuthContext.Provider value={contextValue}>
      {children}
    </UserAuthContext.Provider>
  );
};
