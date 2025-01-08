import { useSelector } from 'react-redux';

import { getAuth } from '../ducks/auth';
import { useWallets } from './asset/useWallets';

// Auth wallet
export function useAuthWallet() {
  const wallets = useWallets();
  const authData = useSelector(getAuth);
  const wallet = wallets.find((i) => i.id === authData.wallet);
  const { apikey } = authData;

  return {
    wallet,
    isAuthenticated: Boolean(apikey) && Boolean(wallet?.connected),
  };
}
