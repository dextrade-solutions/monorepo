import { useDispatch, useSelector } from 'react-redux';
import { useAccount, useConnectors, useSignMessage } from 'wagmi';

import { useAuthWallet } from './useAuthWallet';
import { AuthStatus } from '../../app/constants/auth';
import engine from '../../app/engine';
import {
  getAuth,
  getAuthStatus,
  getSession,
  login,
  logout,
  setStatus,
} from '../ducks/auth';
import { AppDispatch, store } from '../store/store';
import { useWallets } from './asset/useWallets';
import { WalletConnectionType } from '../helpers/constants/wallets';

export function useAuthP2P() {
  const { keyring } = engine.keyringController;
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector(getAuthStatus);
  // const connectWallet = useWeb3Connection();
  const authWallet = useAuthWallet();
  const { signMessage } = useSignMessage();
  const wallets = useWallets({
    connectionType: [WalletConnectionType.eip6963],
  });

  const inProgress = [AuthStatus.signing, AuthStatus.authenticating].includes(
    authStatus,
  );

  return {
    logout: () => {
      dispatch(logout());
      authWallet.wallet && authWallet.wallet.disconnect();
    },
    login: async ({
      wallet,
      onSuccess,
    }: {
      wallet?: string;
      onSuccess?: (...args: any) => any;
    }) => {
      const { apikey } = getAuth(store.getState());
      const { signature } = getSession(store.getState());
      const loginWallet =
        authWallet.wallet || wallets.find((i) => i.name === wallet);

      if (!loginWallet) {
        throw new Error('auth - no wallet found');
      }
      const isConnected = loginWallet.connected;

      if (!isConnected) {
        await loginWallet.connect();
      }
      const onSignedMessage = async (result: string) => {
        await dispatch(login(keyring, result, loginWallet.name));
        return onSuccess && onSuccess();
      };

      const processSign = () =>
        new Promise((resolve, reject) => {
          if (inProgress) {
            return null;
          }
          dispatch(setStatus(AuthStatus.signing));
          signMessage(
            {
              connector: loginWallet.connected.connector,
              message: engine.keyringController.publicKey,
            },
            {
              onSuccess: (result: string) => {
                resolve(onSignedMessage(result));
              },
              onError: (e) => {
                dispatch(setStatus(AuthStatus.failed));
                reject(e);
              },
            },
          );
        });

      if (apikey && authStatus !== AuthStatus.failed) {
        return onSuccess && onSuccess(processSign);
      }

      if (signature) {
        return onSignedMessage(signature);
      }

      return processSign();
    },
  };
}
