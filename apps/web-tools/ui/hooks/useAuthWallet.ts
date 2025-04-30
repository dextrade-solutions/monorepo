import { useSelector } from 'react-redux';

import { getAuth } from '../ducks/auth';
import { useWallets } from './asset/useWallets';
import { AuthType } from './useAuthP2P';
// import { useOkto } from '@okto_web3/react-sdk';

// Auth wallet
export function useAuthWallet() {
  const wallets = useWallets();
  const authData = useSelector(getAuth);
  // const oktoClient = useOkto();
  let wallet = wallets.find((i) => i.id === authData.wallet);
  const { apikey } = authData;

  if (authData.wallet === AuthType.okto) {
    wallet = {
      id: authData.wallet,
      connected: {
        // address: oktoClient.userSWA,
        connectionType: 'okto',
        walletName: 'Okto',
      },
    };
  }

  return {
    wallet,
    authData,
    isAuthenticated: Boolean(apikey) && Boolean(wallet?.connected),
  };
}
