import { useDispatch, useSelector } from 'react-redux';
import { useConnectors, useSignMessage } from 'wagmi';
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
import useConnection from './wallets/useConnection';
import { WalletConnectionType } from '../helpers/constants/wallets';
import keypairWalletConnection from '../helpers/utils/connections/keypair';

export function useAuthP2P() {
  const { keyring } = engine.keyringController;
  const dispatch = useDispatch<AppDispatch>();
  const authStatus = useSelector(getAuthStatus);
  const keypairConnection = useConnection(keypairWalletConnection);
  const authWallet = useAuthWallet();
  const wallets = useWallets({
    connectionType: [
      WalletConnectionType.eip6963,
      WalletConnectionType.tronlink,
      WalletConnectionType.wcEip155,
      WalletConnectionType.wcTron,
    ],
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
      walletId,
      onSuccess,
    }: {
      walletId?: string | null;
      onSuccess?: (...args: any) => any;
    }) => {
      const { apikey } = getAuth(store.getState());
      const { signature } = getSession(store.getState());
      let loginWallet =
        authWallet.wallet || wallets.find((i) => i.id === walletId);

      if (!loginWallet) {
        // if auth wallet is not setted, then use keypair connection
        loginWallet = keypairConnection;
      }
      const isConnected = loginWallet.connected;

      if (!isConnected) {
        await loginWallet.connect();
      }
      const onSignedMessage = async (sign: string) => {
        await dispatch(login(keyring, sign, loginWallet.id));
        return onSuccess && onSuccess();
      };

      const processSign = async () => {
        if (loginWallet.name === 'Keypair Wallet') {
          // const sign = engine.keyringController.signDER(
          //   engine.keyringController.publicKey,
          // );
          const web3 = new Web3();
          const result = web3.eth.accounts.sign(
            engine.keyringController.publicKey,
            `0x${engine.keyringController.privateKey}`,
          );
          return onSignedMessage(result.signature);
        }

        if (inProgress) {
          return null;
        }
        dispatch(setStatus(AuthStatus.signing));
        // const connector = connectors.find((i) => i.name === loginWallet.name);
        try {
          const result = await loginWallet.signMessage(
            engine.keyringController.publicKey,
          );
          return onSignedMessage(result);
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
