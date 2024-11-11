import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Connector, useAccount, useConnectors, useSignMessage } from 'wagmi';

import { AuthStatus } from '../../app/constants/auth';
import engine from '../../app/engine';
import {
  getAuth,
  getAuthStatus,
  getSession,
  login,
  setStatus,
} from '../ducks/auth';
import { AppDispatch } from '../store/store';

export function useAuthP2P() {
  const { keyring } = engine.keyringController;
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector(getAuthStatus);
  const account = useAccount();
  // const connectWallet = useWeb3Connection();
  const { apikey } = useSelector(getAuth);
  const { signature } = useSelector(getSession);
  const { signMessage } = useSignMessage();
  const connectors = useConnectors();

  const inProgress = [AuthStatus.signing, AuthStatus.authenticating].includes(
    authStatus,
  );

  return async ({
    wallet,
    onSuccess,
  }: {
    wallet?: string;
    onSuccess?: (...args: any) => any;
  }) => {
    engine.queryClient.removeQueries({
      queryKey: ['authenticatedUser'],
      exact: true,
    });
    const connector =
      connectors.find((i) => i.name === wallet) || account.connector;
    if (!connector) {
      throw new Error('auth - no connector found');
    }
    const isConnected = await connector?.isAuthorized();
    if (!isConnected) {
      await connector.connect();
    }
    const onSignedMessage = async (result: string) => {
      await dispatch(login(keyring, result, connector.name));
      return onSuccess && onSuccess();
    };

    const processSign = () =>
      new Promise((resolve, reject) => {
        if (inProgress) {
          return null;
        }
        dispatch(setStatus(AuthStatus.signing));
        signMessage(
          { connector, message: engine.keyringController.publicKey },
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
  };
}
