import { useOkto } from '@okto_web3/react-sdk';
import { useDispatch, useSelector } from 'react-redux';
import Web3 from 'web3';

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

export enum AuthType {
  keypair = 'keypair',
  okto = 'okto',
  connectedWallet = 'connectedWallet',
}

export function useAuthP2P() {
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector(getAuthStatus);
  const authWallet = useAuthWallet();
  const wallets = useWallets({
    includeKeypairWallet: true,
  });
  const oktoClient = useOkto();

  const inProgress = [AuthStatus.signing, AuthStatus.authenticating].includes(
    authStatus,
  );

  return {
    logout: async () => {
      dispatch(logout());
      if (authWallet.wallet) {
        authWallet.wallet && authWallet.wallet.disconnect();
      }
    },
    login: async ({
      type = AuthType.connectedWallet,
      walletId,
      credentialResponse,
      onSuccess,
    }: {
      type: AuthType;
      walletId?: string | null;
      credentialResponse?: { credential: string };
      onSuccess?: (...args: any) => any;
    }) => {
      const { apikey } = getAuth(store.getState());
      const { signature } = getSession(store.getState());

      const onSignedMessage = async (sign: string) => {
        await dispatch(
          login(engine.keyringController.keyring, sign, walletId || type),
        );
        return onSuccess && onSuccess();
      };

      const processSign = async () => {
        if (inProgress) {
          return null;
        }
        dispatch(setStatus(AuthStatus.signing));

        try {
          if (type === AuthType.keypair) {
            const web3 = new Web3();
            const result = web3.eth.accounts.sign(
              engine.keyringController.publicKey,
              `0x${engine.keyringController.privateKey}`,
            );
            return onSignedMessage(result.signature);
          }
          if (type === AuthType.okto) {
            await oktoClient.loginUsingOAuth({
              idToken: credentialResponse.credential,
              provider: 'google',
            });
            const result = await oktoClient.signMessage(
              engine.keyringController.publicKey,
            );
            return onSignedMessage(result);
          }
          if (type === AuthType.connectedWallet) {
            const loginWallet =
              authWallet.wallet || wallets.find((i) => i.id === walletId);

            if (!loginWallet) {
              throw new Error('Login wallet not found');
            }

            const isConnected = loginWallet.connected;

            if (!isConnected) {
              await loginWallet.connect();
            }
            const result = await loginWallet.signMessage(
              engine.keyringController.publicKey,
            );
            return onSignedMessage(result);
          }
          throw new Error('Invalid auth type');
        } catch (e) {
          dispatch(setStatus(AuthStatus.failed));
          throw e;
        }
      };

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
